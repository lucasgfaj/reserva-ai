import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBlockDto {
  @ApiPropertyOptional({ example: 'Bloco A - Atualizado', description: 'Novo nome do bloco' })
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @IsOptional()
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres.' })
  name?: string;
}
