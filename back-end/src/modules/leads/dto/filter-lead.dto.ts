import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Stage, Channel } from '../schemas/lead.schema';

export class FilterLeadDto extends PaginationDto {
  @ApiPropertyOptional({ 
    enum: Stage, 
    description: 'Filtrar leads por estágio específico no pipeline' 
  })
  @IsOptional()
  @IsEnum(Stage)
  stage?: Stage;

  @ApiPropertyOptional({ 
    enum: Channel, 
    description: 'Filtrar leads por canal de origem' 
  })
  @IsOptional()
  @IsEnum(Channel)
  channel?: Channel;

  @ApiPropertyOptional({ 
    example: 'Iago', 
    description: 'Termo de busca para pesquisar leads pelo nome' 
  })
  @IsOptional()
  @IsString()
  q?: string;
}
