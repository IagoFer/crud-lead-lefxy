import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Stage, Channel } from '../schemas/lead.schema';

export class CreateLeadDto {
  @ApiProperty({ example: 'Iago Fernandes', description: 'Nome completo do lead' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '(11) 99999-9999', description: 'Telefone de contato' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @IsString()
  phone!: string;

  @ApiProperty({ enum: Channel, example: Channel.WHATSAPP, description: 'Canal de origem do lead' })
  @IsEnum(Channel, { message: 'Canal inválido' })
  @IsOptional()
  channel?: Channel = Channel.WHATSAPP;

  @ApiProperty({ enum: Stage, example: Stage.NEW, description: 'Estágio atual no pipeline' })
  @IsEnum(Stage, { message: 'Estágio inválido' })
  @IsOptional()
  stage?: Stage = Stage.NEW;
}
