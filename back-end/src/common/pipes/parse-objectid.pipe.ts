import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, string> {
  transform(value: any): string {
    const validObjectId = Types.ObjectId.isValid(value);

    if (!validObjectId) {
      throw new BadRequestException(`Valor "${value}" não é um ObjectId padrão do MongoDB válido.`);
    }

    return value;
  }
}
