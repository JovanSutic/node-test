import { Module } from "@nestjs/common";
import { SpecialsController } from "./specials.controller";
import { SpecialsService } from "./specials.service";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [SpecialsController],
  providers: [SpecialsService, ConfigService],
})
export class SpecialsModule {}
