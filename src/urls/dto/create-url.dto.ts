import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'URL original que será encurtada',
    example: 'https://exemplo.com/pagina-com-url-muito-longa',
  })
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;
}
