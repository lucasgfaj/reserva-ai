import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateCondominiumDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string.' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'O endereço deve ser uma string.' })
  @MinLength(5, { message: 'O endereço deve ter no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'O endereço deve ter no máximo 255 caracteres.' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'O fuso horário deve ser uma string.' })
  timezone?: string;
}
