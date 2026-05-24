import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'João Silva', description: 'Nome do usuário' })
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'joao@email.com', description: 'E-mail do usuário' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsOptional()
  email?: string;
}
