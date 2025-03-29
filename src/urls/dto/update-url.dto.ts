import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiProperty({
    description: 'Nova URL original',
    example: 'https://exemplo.com/nova-url-para-atualizar',
  })
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;
}
