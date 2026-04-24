import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({ 
    example: 'Residencial Horizonte', 
    description: 'Nome do condomínio (Mapeado para Condominium.name - VARCHAR 150)' 
  })
  @IsString()
  @IsNotEmpty()
  condominiumName: string;

  @ApiProperty({ 
    example: 'Rua das Flores, 123', 
    description: 'Endereço completo (Mapeado para Condominium.address - VARCHAR 255)' 
  })
  @IsString()
  @IsNotEmpty()
  condominiumAddress: string;

  @ApiProperty({ 
    example: 'Lucas Admin', 
    description: 'Nome completo do administrador (Mapeado para User.name - VARCHAR 120)' 
  })
  @IsString()
  @IsNotEmpty()
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
    description: 'Senha que será hasheada via Bcrypt (Mapeado para User.passwordHash)',
    minLength: 6 
  })
  @IsString()
  @MinLength(6)
  adminPassword: string;
}
