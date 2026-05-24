import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'UUID da área comum' })
  @IsString()
  @IsNotEmpty()
  commonAreaId: string;

  @ApiProperty({ description: 'Data da reserva (YYYY-MM-DD)', example: '2026-07-15' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })
  date: string;

  @ApiProperty({ description: 'Horário de início (HH:MM)', example: '10:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime deve estar no formato HH:MM' })
  startTime: string;

  @ApiProperty({ description: 'Horário de fim (HH:MM)', example: '12:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime deve estar no formato HH:MM' })
  endTime: string;

  @ApiProperty({ description: 'Observações', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'UUID do morador (apenas admin)', required: false })
  @IsString()
  @IsOptional()
  residentId?: string;
}
