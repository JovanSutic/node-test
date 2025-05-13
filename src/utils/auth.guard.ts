import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    return true;

    // const decodedToken = this.jwtService.decode(token);
    // const tokenSub = this.configService.get<string>("AWS_COGNITO_APP_SUB");
    // const resourceServer = this.configService.get<string>("AWS_COGNITO_RESOURCE_SEVER");

    // if (
    //   !decodedToken ||
    //   !decodedToken?.exp ||
    //   !decodedToken?.sub ||
    //   !decodedToken?.scope
    // ) {
    //   throw new UnauthorizedException("Token does not contain needed claims");
    // }

    // const expirationTime = decodedToken.exp * 1000;
    // const currentTime = Date.now();

    // if (currentTime > expirationTime) {
    //   throw new UnauthorizedException("Token has expired");
    // }

    // if (decodedToken?.sub !== tokenSub) {
    //   throw new UnauthorizedException("Sub not valid");
    // }

    // if (decodedToken?.scope !== `${resourceServer}/write`) {
    //   throw new UnauthorizedException("Scope not valid");
    // }

    // return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
