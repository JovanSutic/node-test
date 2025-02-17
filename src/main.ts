import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS if needed
  app.enableCors();

  // Start the server on port 3000 (default)
  await app.listen(3000);
}

bootstrap();
