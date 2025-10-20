import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { CitiesModule } from "../cities/cities.module";
import { CurrenciesModule } from "../helpers/currency.module";
import { PricesModule } from "../prices/prices.module";
import { ReportsService } from "./reports.service";
import { UsersModule } from "../users/users.module";
import { DefValueModule } from '../def_value/def_value.module';

@Module({
  imports: [DefValueModule, CitiesModule, CurrenciesModule, PricesModule, UsersModule],
  controllers: [ReportsController],
  providers: [ReportsService, PrismaService, JwtService],
})
export class ReportsModule {}
