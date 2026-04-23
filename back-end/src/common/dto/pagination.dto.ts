import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Número da página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Quantidade de itens por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    example: 'createdAt', 
    enum: ['name', 'createdAt', 'updatedAt', 'stage', 'channel'],
    description: 'Campo para ordenação' 
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'updatedAt', 'stage', 'channel'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    example: 'desc', 
    enum: ['asc', 'desc'],
    description: 'Direção da ordenação' 
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
