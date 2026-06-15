import { IsString, IsOptional, MinLength, MaxLength, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: '102', description: 'Novo número da unidade' })
  @IsString({ message: 'O número deve ser um texto válido.' })
  @IsOptional()
  @MinLength(1, { message: 'O número deve ter no mínimo 1 caractere.' })
  @MaxLength(20, { message: 'O número deve ter no máximo 20 caracteres.' })
  number?: string;

  @ApiPropertyOptional({ example: 'uuid-do-bloco', description: 'UUID do bloco' })
  @IsUUID('4', { message: 'O ID do bloco deve ser um UUID válido.' })
  @IsOptional()
  blockId?: string;
}
