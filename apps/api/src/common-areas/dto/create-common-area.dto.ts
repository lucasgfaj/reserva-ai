import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MaxLength, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommonAreaDto {
  @ApiProperty({ example: 'Salão de Festas', description: 'Nome da área comum (2-120 caracteres)' })
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(120, { message: 'O nome deve ter no máximo 120 caracteres.' })
  name: string;

  @ApiPropertyOptional({ example: 'Espaço para eventos', description: 'Descrição da área comum' })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto válido.' })
  description?: string;

  @ApiPropertyOptional({ example: 50, description: 'Capacidade máxima (0-10000)' })
  @IsOptional()
  @IsNumber({}, { message: 'A capacidade deve ser um número válido.' })
  @Min(0, { message: 'A capacidade não pode ser negativa.' })
  @Max(10000, { message: 'A capacidade não pode exceder 10000.' })
  capacity?: number;

  @ApiProperty({ example: '08:00', description: 'Horário de abertura (HH:MM)' })
  @IsString({ message: 'O horário de abertura deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O horário de abertura é obrigatório.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'O horário de abertura deve estar no formato HH:MM (ex: 08:00).' })
  openTime: string;

  @ApiProperty({ example: '22:00', description: 'Horário de fechamento (HH:MM)' })
  @IsString({ message: 'O horário de fechamento deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O horário de fechamento é obrigatório.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'O horário de fechamento deve estar no formato HH:MM (ex: 22:00).' })
  closeTime: string;

  @ApiPropertyOptional({ example: '1,2,3,4,5,6,7', description: 'Dias de funcionamento (1=Domingo a 7=Sábado)' })
  @IsOptional()
  @IsString({ message: 'Os dias de funcionamento devem ser um texto válido.' })
  @Matches(/^(\d+,)*\d+$/, { message: 'Os dias de funcionamento devem ser números de 1 a 7 separados por vírgula (ex: 1,2,3,4,5,6,7).' })
  operatingDays?: string;

  @ApiPropertyOptional({ example: true, description: 'Indica se requer aprovação do administrador' })
  @IsOptional()
  @IsBoolean({ message: 'O campo requiresApproval deve ser verdadeiro ou falso.' })
  requiresApproval?: boolean;

  @ApiPropertyOptional({ example: 'pool', description: 'Ícone (Material Symbol) para representar a área' })
  @IsOptional()
  @IsString({ message: 'O ícone deve ser um texto válido.' })
  icon?: string;

  @ApiPropertyOptional({ example: false, description: 'Indica se a área está em manutenção' })
  @IsOptional()
  @IsBoolean({ message: 'O campo isUnderMaintenance deve ser verdadeiro ou falso.' })
  isUnderMaintenance?: boolean;
}
