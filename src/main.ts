import { NestFactory } from "@nestjs/core";
import 'reflect-metadata';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as fs from "fs";
import * as path from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  if (process.env.NODE_ENV === "development") {
    const options = new DocumentBuilder()
      .setTitle("My API")
      .setDescription("The API documentation")
      .setVersion("1.0")
      .build();

    const document = SwaggerModule.createDocument(app, options);
    const swaggerFilePath = path.join(__dirname, "swagger-doc.json");
    fs.writeFileSync(swaggerFilePath, JSON.stringify(document, null, 2));

    console.log(`Swagger was created in the ${swaggerFilePath} path.`);
  }

  await app.listen(3000);
}

bootstrap();
