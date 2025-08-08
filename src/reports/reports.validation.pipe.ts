import {
  Injectable,
  type PipeTransform,
  type ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ReportUserDataDto } from './reports.dto';
import { CitiesService } from '../cities/cities.service';

@Injectable()
export class ValidateReportStructurePipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const instance = plainToInstance(ReportUserDataDto, value);
    const errors = await validate(instance);

    if (errors.length > 0) {
      throw new BadRequestException(errors.map(e => Object.values(e.constraints || {})).flat());
    }

    return value;
  }
}

@Injectable()
export class ValidateCityIdPipe implements PipeTransform {
  constructor(private readonly citiesService: CitiesService) {}

  async transform(value: any) {
    const cityId = value.cityId;
    if (!cityId || typeof cityId !== 'number') {
      throw new BadRequestException('Invalid or missing cityId');
    }

    const city = await this.citiesService.getById(cityId);
    if (!city) {
      throw new BadRequestException(`City with ID ${cityId} does not exist.`);
    }

    return value;
  }
}