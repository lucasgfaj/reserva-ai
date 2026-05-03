import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResidentDto {
  @ApiProperty({
    example: 'João Morador',
    description: 'Nome completo do morador (3-120 caracteres)',
  })
  @IsString({ message: 'Nome inválido.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 'joao@reservaai.com.br',
    description: 'E-mail único para login do morador',
  })
  @IsEmail(undefined, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiPropertyOptional({
    example: 'Test1234',
    description:
      'Senha opcional. Se não fornecida, será gerada automaticamente (8 caracteres)',
    minLength: 8,
  })
  @IsOptional()
  @IsString({ message: 'Senha inválida.' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  @MaxLength(40)
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/, {
    message: 'A senha deve conter pelo menos uma letra e um número',
  })
  password?: string;

  @ApiPropertyOptional({
    example: 'uuid-da-unidade',
    description: 'UUID da unidade residencial (opcional)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID da unidade inválido.' })
  unitId?: string;

  @ApiPropertyOptional({
    example: '12345678901',
    description: 'Documento do morador (CPF/RG)',
  })
  @IsOptional()
  @IsString({ message: 'Documento inválido.' })
  @MaxLength(20)
  document?: string;

  @ApiPropertyOptional({
    example: '11999999999',
    description: 'Telefone de contato do morador',
  })
  @IsOptional()
  @IsString({ message: 'Telefone inválido.' })
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o morador pode realizar reservas (padrão: true)',
  })
  @IsOptional()
  @IsBoolean({ message: 'Valor de canBook inválido.' })
  canBook?: boolean;
}
