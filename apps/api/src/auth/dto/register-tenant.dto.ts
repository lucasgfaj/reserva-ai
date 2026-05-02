import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({
    example: 'Residencial Horizonte',
    description:
      'Nome do condomínio (Mapeado para Condominium.name - VARCHAR 150)',
  })
  @IsString({ message: 'Nome do condomínio inválido.' })
  @IsNotEmpty({ message: 'Nome do condomínio é obrigatório.' })
  @MinLength(3, {
    message: 'Nome do condomínio deve ter no mínimo 3 caracteres.',
  })
  @MaxLength(150, {
    message: 'Nome do condomínio deve ter no máximo 150 caracteres.',
  })
  condominiumName: string;

  @ApiProperty({
    example: 'Rua das Flores, 123',
    description:
      'Endereço completo (Mapeado para Condominium.address - VARCHAR 255)',
  })
  @IsString({ message: 'Endereço inválido.' })
  @IsNotEmpty({ message: 'Endereço é obrigatório.' })
  @MaxLength(255, { message: 'Endereço deve ter no máximo 255 caracteres.' })
  condominiumAddress: string;

  @ApiProperty({
    example: 'Lucas Admin',
    description:
      'Nome completo do administrador (Mapeado para User.name - VARCHAR 120)',
  })
  @IsString({ message: 'Nome inválido.' })
  @IsNotEmpty({ message: 'Nome do administrador é obrigatório.' })
  @MaxLength(120, { message: 'Nome deve ter no máximo 120 caracteres.' })
  adminName: string;

  @ApiProperty({
    example: 'admin@reservaai.com.br',
    description:
      'E-mail para login (Mapeado para User.email - VARCHAR 150 - Único)',
  })
  @IsEmail(undefined, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  adminEmail: string;

  @ApiProperty({
    example: 'SenhaSegura123!',
    description:
      'Senha que será hasheada via Bcrypt (mín 8 chars, letra, número e especial)',
    minLength: 8,
  })
  @IsString({ message: 'Senha inválida.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres.' })
  @MaxLength(40, { message: 'Senha deve ter no máximo 40 caracteres.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, {
    message:
      'Senha deve conter pelo menos uma letra, um número e um caractere especial (!@#$%^&*)',
  })
  adminPassword: string;
}
