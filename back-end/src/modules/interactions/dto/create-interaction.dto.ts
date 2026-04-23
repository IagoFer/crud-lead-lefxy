import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { InteractionType } from '../schemas/interaction.schema';

export class CreateInteractionDto {
  @IsNotEmpty({ message: 'O tipo da interação é obrigatório' })
  @IsEnum(InteractionType, { message: 'Tipo deve ser MESSAGE, CALL ou NOTE' })
  type: InteractionType;

  @IsNotEmpty({ message: 'O conteúdo é obrigatório' })
  @IsString()
  content: string;

  @IsEnum(['LEAD', 'USER'], { message: 'Origem deve ser LEAD ou USER' })
  from?: string;
}
