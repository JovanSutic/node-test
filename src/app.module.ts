import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CitiesModule } from './cities/cities.module';

@Module({
  imports: [UsersModule, CitiesModule],
})
export class AppModule {}
