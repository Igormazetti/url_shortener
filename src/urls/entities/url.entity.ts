import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('urls')
export class Url extends BaseEntity {
  @ApiProperty({
    description: 'URL original',
    example: 'https://exemplo.com/pagina-com-url-muito-longa',
  })
  @Column()
  originalUrl: string;

  @ApiProperty({
    description: 'Código curto único para a URL',
    example: 'abc123',
  })
  @Column({ unique: true })
  shortCode: string;

  @ApiProperty({
    description: 'Número de cliques na URL encurtada',
    example: 42,
  })
  @Column({ default: 0 })
  clicks: number;

  @ManyToOne(() => User, (user: User) => user.urls, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'ID do usuário que criou a URL (se autenticado)',
    example: '5f8d0d55-e0a7-4b9b-b0b5-e6b6d0b0b0b0',
    required: false,
  })
  @Column({ nullable: true })
  userId: string;
}
