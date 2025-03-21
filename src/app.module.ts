import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { CitiesModule } from "./cities/cities.module";
import { YearsModule } from "./years/years.module";
import { ProductsModule } from "./products/products.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, CitiesModule, YearsModule, ProductsModule],
})
export class AppModule {}
