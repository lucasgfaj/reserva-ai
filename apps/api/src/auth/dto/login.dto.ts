import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@reservaai.com.br',
    description: 'E-mail do usuário cadastrado',
  })
  @IsEmail(undefined, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email: string;

  @ApiProperty({
    example: 'Senha123!',
    description: 'Senha do usuário',
    minLength: 8,
  })
  @IsString({ message: 'Senha inválida.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres.' })
  password: string;
}
