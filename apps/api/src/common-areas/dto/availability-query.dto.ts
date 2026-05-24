import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityQueryDto {
  @ApiProperty({
    description: 'Data para consulta (YYYY-MM-DD)',
    example: '2026-06-15',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date deve estar no formato YYYY-MM-DD',
  })
  date!: string;

  @ApiProperty({
    description: 'Horário de início (HH:MM)',
    example: '10:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime deve estar no formato HH:MM',
  })
  startTime?: string;

  @ApiProperty({
    description: 'Horário de fim (HH:MM)',
    example: '12:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime deve estar no formato HH:MM',
  })
  endTime?: string;
}
