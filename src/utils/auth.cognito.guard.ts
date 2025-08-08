import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import * as jwt from "jsonwebtoken";
import axios from "axios";
import jwkToPem from "jwk-to-pem";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private readonly cognito: CognitoIdentityProviderClient;
  private readonly region: string;
  private readonly userPoolId: string;
  private readonly clientId: string;
  private cachedKeys: any = null;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>("AWS_COGNITO_REGION")!;
    this.userPoolId = this.configService.get<string>(
      "AWS_COGNITO_USER_POOL_ID"
    )!;
    this.clientId = this.configService.get<string>("AWS_COGNITO_CLIENT_ID")!;

    this.cognito = new CognitoIdentityProviderClient({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_USER_ACCESS_KEY")!,
        secretAccessKey: this.configService.get<string>(
          "AWS_USER_ACCESS_SECRET"
        )!,
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid Authorization header"
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = await this.verifyToken(token);

      const username =
        decoded["cognito:username"] || decoded["username"] || decoded["sub"];

      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      await this.cognito.send(command); // will throw if user doesn't exist

      req.user = decoded; // attach user info to request
      return true;
    } catch (err) {
      console.error("CognitoAuthGuard Error:", err);
      throw new UnauthorizedException("Invalid or unverified token");
    }
  }

  private async verifyToken(token: string): Promise<any> {
    const header = JSON.parse(
      Buffer.from(token.split(".")[0], "base64").toString("utf-8")
    );
    const kid = header.kid;

    if (!this.cachedKeys) {
      const url = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;
      const response = await axios.get(url);
      this.cachedKeys = response.data.keys;
    }

    const jwk = this.cachedKeys.find((key: any) => key.kid === kid);
    if (!jwk) throw new UnauthorizedException("JWK not found for token");

    const pem = this.jwkToPem(jwk);

    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        pem,
        { algorithms: ["RS256"], audience: this.clientId },
        (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        }
      );
    });
  }

  private jwkToPem(jwk: any): string {
    const rsaPublicKey = {
      kty: "RSA",
      n: jwk.n,
      e: jwk.e,
    };

    const pem = jwkToPem(rsaPublicKey);
    return pem;
  }
}
