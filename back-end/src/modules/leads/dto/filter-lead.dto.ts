import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Channel, Stage } from '../schemas/lead.schema';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterLeadDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Stage)
  stage?: Stage;

  @IsOptional()
  @IsEnum(Channel)
  channel?: Channel;

  @IsOptional()
  @IsString()
  q?: string;
}
