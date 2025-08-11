import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  exports: [UsersService],
  providers: [UsersService, JwtService],
})
export class UsersModule {}
