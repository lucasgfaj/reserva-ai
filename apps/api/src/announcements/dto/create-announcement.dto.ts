import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Manutenção na Piscina', description: 'Título do comunicado' })
  @IsString({ message: 'O título deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres.' })
  title: string;

  @ApiProperty({ example: 'A piscina estará fechada para manutenção no dia 25/12.', description: 'Conteúdo do comunicado' })
  @IsString({ message: 'O conteúdo deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O conteúdo é obrigatório.' })
  content: string;
}
