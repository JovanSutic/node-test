import {
  Injectable,
  type PipeTransform,
  type ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (
      !value.name ||
      typeof value.name !== "string" ||
      value.name.length < 3
    ) {
      throw new BadRequestException(
        "Name must be a string with at least 3 characters"
      );
    }

    if (
      !value.category ||
      typeof value.category !== "string" ||
      value.category < 3
    ) {
      throw new BadRequestException(
        "Category must be a string with at least 3 characters"
      );
    }

    if (!value.unit || typeof value.unit !== "string" || value.unit < 3) {
      throw new BadRequestException(
        "Unit must be a string with at least 3 characters"
      );
    }

    return value;
  }
}
