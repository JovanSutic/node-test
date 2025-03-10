import {
  BadRequestException,
  Injectable,
  type ArgumentMetadata,
  type PipeTransform,
} from "@nestjs/common";

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const currentYear = new Date().getFullYear();
    if (
      !value.year ||
      Number(value.year) > currentYear ||
      Number(value.year) < 2010
    ) {
      throw new BadRequestException(
        `Year must be higher than 2010 and lower or equal ${currentYear}`
      );
    }

    return value;
  }
}
