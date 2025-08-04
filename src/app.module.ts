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
import { CountriesModule } from "./countries/countries.module";
import { AspectModule } from "./aspect/aspect.module";
import { DefinitionModule } from "./definition/definition.module";
import { DefValueModule } from "./def_value/def_value.module";
import { BlogsModule } from "./blogs/blogs.module";
import { LayersModule } from "./layers/layers.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    CountriesModule,
    AspectModule,
    DefinitionModule,
    DefValueModule,
    BlogsModule,
    LayersModule,
  ],
})
export class AppModule {}
