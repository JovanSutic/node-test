import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { CitiesModule } from "./cities/cities.module";
import { YearsModule } from "./years/years.module";

@Module({
  imports: [UsersModule, CitiesModule, YearsModule],
})
export class AppModule {}
