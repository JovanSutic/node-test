import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value.name || typeof value.name !== 'string' || value.name.length < 3) {
      throw new BadRequestException('Name must be a string with at least 3 characters');
    }

    if (!value.country || typeof value.country !== 'string' || value.country.length < 3) {
        throw new BadRequestException('Country must be a string with at least 3 characters');
      }

    return value;
  }
}
