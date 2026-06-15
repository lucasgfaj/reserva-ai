import { IsString, IsNotEmpty, MaxLength, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: '101', description: 'Número da unidade' })
  @IsString({ message: 'O número deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O número é obrigatório.' })
  @MinLength(1, { message: 'O número deve ter no mínimo 1 caractere.' })
  @MaxLength(20, { message: 'O número deve ter no máximo 20 caracteres.' })
  number: string;

  @ApiProperty({ example: 'uuid-do-bloco', description: 'UUID do bloco' })
  @IsUUID('4', { message: 'O ID do bloco deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O bloco é obrigatório.' })
  blockId: string;
}
