import {
  Injectable,
  type PipeTransform,
  type ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { isNumber } from "../utils/numbers";

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
      !value.country ||
      typeof value.country !== "string" ||
      value.country.length < 3
    ) {
      throw new BadRequestException(
        "Country must be a string with at least 3 characters"
      );
    }

    if (!value.numbeo_id || !isNumber(value.numbeo_id)) {
      throw new BadRequestException(
        "Numbeo id must be a number with at least 3 length"
      );
    }

    return value;
  }
}
@Injectable()
export class ObjectTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item.id) {
            const idAsNumber = Number(item.id);
            if (isNaN(idAsNumber)) {
              throw new BadRequestException("Id must be a valid number");
            }
            value[index].id = idAsNumber;
          }
        });
      } else {
        if (value.id) {
          const idAsNumber = Number(value.id);
          if (isNaN(idAsNumber)) {
            throw new BadRequestException("Id must be a valid number");
          }
          value.id = idAsNumber;
        }
      }
    }
    return value;
  }
}
