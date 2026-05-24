import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'SenhaAtual123!', description: 'Senha atual do usuário' })
  @IsString({ message: 'A senha atual deve ser um texto válido.' })
  @IsNotEmpty({ message: 'A senha atual é obrigatória.' })
  currentPassword: string;

  @ApiProperty({ example: 'NovaSenha456!', description: 'Nova senha' })
  @IsString({ message: 'A nova senha deve ser um texto válido.' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória.' })
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
  newPassword: string;
}
