import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddClosedDateDto {
  @ApiProperty({ example: '2026-12-25', description: 'Data a ser fechada (YYYY-MM-DD)' })
  @IsString({ message: 'A data deve ser um texto válido.' })
  @IsNotEmpty({ message: 'A data é obrigatória.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD.' })
  date: string;
}

export class RemoveClosedDateDto {
  @ApiProperty({ example: '2026-12-25', description: 'Data a ser reaberta (YYYY-MM-DD)' })
  @IsString({ message: 'A data deve ser um texto válido.' })
  @IsNotEmpty({ message: 'A data é obrigatória.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD.' })
  date: string;
}
