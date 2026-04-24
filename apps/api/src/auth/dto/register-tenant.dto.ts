import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  condominiumName: string;

  @IsString()
  @IsNotEmpty()
  condominiumAddress: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;
}
