import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InteractionType } from '../schemas/interaction.schema';

export class CreateInteractionDto {
  @ApiProperty({ 
    enum: InteractionType, 
    example: InteractionType.CALL, 
    description: 'Tipo da interação realizada' 
  })
  @IsNotEmpty({ message: 'O tipo da interação é obrigatório' })
  @IsEnum(InteractionType, { message: 'Tipo deve ser MESSAGE, CALL ou NOTE' })
  type!: InteractionType;

  @ApiProperty({ 
    example: 'Cliente interessado no serviço de consultoria tributária.', 
    description: 'Conteúdo detalhado da interação' 
  })
  @IsNotEmpty({ message: 'O conteúdo é obrigatório' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ 
    enum: ['LEAD', 'USER'], 
    example: 'USER', 
    description: 'Quem iniciou a interação' 
  })
  @IsOptional()
  @IsEnum(['LEAD', 'USER'], { message: 'Origem deve ser LEAD ou USER' })
  from?: string;
}
