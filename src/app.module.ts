import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { CitiesModule } from "./cities/cities.module";
import { YearsModule } from "./years/years.module";
import { ProductsModule } from "./products/products.module";
import { CategoriesModule } from "./categories/categories.module";
import { PricesModule } from "./prices/prices.module";
import { ConfigModule } from "@nestjs/config";
import { SocialLifestyleModule } from "./social_lifestyle/social_lifestyle.module";
import { CrimesModule } from "./crimes/crimes.module";
import { WeathersModule } from "./weathers/weathers.module";
import { CityContextModule } from "./city_context/city_context.module";
import { CityFeelModule } from "./city_feel/city_feel.module";
import { SpecialsModule } from "./specials/specials.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    CitiesModule,
    YearsModule,
    ProductsModule,
    CategoriesModule,
    PricesModule,
    SocialLifestyleModule,
    CrimesModule,
    WeathersModule,
    CityContextModule,
    CityFeelModule,
    SpecialsModule,
  ],
})
export class AppModule {}
