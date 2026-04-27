import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({ 
    example: 'Residencial Horizonte', 
    description: 'Nome do condomínio (Mapeado para Condominium.name - VARCHAR 150)' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  condominiumName: string;

  @ApiProperty({ 
    example: 'Rua das Flores, 123', 
    description: 'Endereço completo (Mapeado para Condominium.address - VARCHAR 255)' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  condominiumAddress: string;

  @ApiProperty({ 
    example: 'Lucas Admin', 
    description: 'Nome completo do administrador (Mapeado para User.name - VARCHAR 120)' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  adminName: string;

  @ApiProperty({ 
    example: 'admin@reservaai.com.br', 
    description: 'E-mail para login (Mapeado para User.email - VARCHAR 150 - Único)' 
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ 
    example: 'SenhaSegura123', 
    description: 'Senha que será hasheada via Bcrypt (mín 8 chars, letra, número e especial)',
    minLength: 8 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(40)
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, {
    message: 'adminPassword must contain at least one letter, one number, and one special character (!@#$%^&*)'
  })
  adminPassword: string;
}
