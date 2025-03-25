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

    return value;
  }
}
