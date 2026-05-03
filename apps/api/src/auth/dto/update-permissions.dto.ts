import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionsDto {
  @ApiProperty({
    example: false,
    description: 'Indica se o morador pode realizar reservas',
  })
  @IsBoolean({ message: 'Valor de canBook deve ser booleano.' })
  canBook: boolean;
}
