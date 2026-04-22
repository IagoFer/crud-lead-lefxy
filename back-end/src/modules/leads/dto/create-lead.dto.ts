import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Channel, Stage } from '../schemas/lead.schema';

export class CreateLeadDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @IsString()
  phone: string;

  @IsOptional()
  @IsEnum(Channel, { message: 'Canal deve ser WHATSAPP, INSTAGRAM ou SITE' })
  channel?: Channel;

  @IsOptional()
  @IsEnum(Stage, { message: 'Estágio deve ser NEW, QUALIFIED, PROPOSAL, WON ou LOST' })
  stage?: Stage;
}
