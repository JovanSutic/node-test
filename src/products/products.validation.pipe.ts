import {
  Injectable,
  type PipeTransform,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (
      !value.name ||
      typeof value.name !== "string" ||
      value.name.length < 3
    ) {
      throw new BadRequestException(
        "Name must be a string with at least 3 characters"
      );
    }

    if (!value.categoryId || typeof value.categoryId !== "number") {
      throw new BadRequestException("categoryId must be a number");
    }

    if (!value.unit || typeof value.unit !== "string" || value.unit < 3) {
      throw new BadRequestException(
        "Unit must be a string with at least 3 characters"
      );
    }

    return value;
  }
}
