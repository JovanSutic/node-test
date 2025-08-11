import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import  { JwtService } from "@nestjs/jwt";

@Injectable()
export class UsersService {
  constructor(private readonly jwtService: JwtService) {}

  extractUserUuidFromRequest(req: any): string {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new BadRequestException('Missing authorization token');
    }

    let userUuid = '';
    try {
      const decoded = this.jwtService.decode(token) as any;
      userUuid = decoded?.sub;
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }

    if (!userUuid) {
      throw new BadRequestException('No sub in the token');
    }

    return userUuid;
  }
}
