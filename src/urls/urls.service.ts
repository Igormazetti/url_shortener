import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    private configService: ConfigService,
  ) {}

  private generateShortCode(length: number = 6): string {
    return crypto.randomBytes(length).toString('base64url').slice(0, length);
  }

  async create(createUrlDto: CreateUrlDto, user?: User): Promise<Url> {
    const shortCode = this.generateShortCode(6);

    const url = this.urlsRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      user,
      userId: user?.id,
    });

    await this.urlsRepository.save(url);

    return url;
  }

  async findAll(userId: string): Promise<Url[]> {
    return await this.urlsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    console.log(`Looking for URL with short code: ${shortCode}`);

    const url = await this.urlsRepository.findOne({
      where: { shortCode },
    });

    if (!url) {
      console.warn(`URL with short code ${shortCode} not found`);
      throw new NotFoundException(`URL with short code ${shortCode} not found`);
    }

    console.log(`Found URL: ${JSON.stringify(url)}`);
    return url;
  }

  async incrementClicks(id: string): Promise<void> {
    try {
      console.log(`Incrementing clicks for URL ID: ${id}`);
      const result = await this.urlsRepository.increment({ id }, 'clicks', 1);

      if (result.affected === 0) {
        console.warn(
          `No URL was updated when incrementing clicks for ID: ${id}`,
        );
      } else {
        console.log(`Successfully incremented clicks for URL ID: ${id}`);
      }
    } catch (error) {
      console.error(`Error incrementing clicks for URL ID: ${id}:`, error);
      throw error;
    }
  }

  async update(
    id: string,
    userId: string,
    updateUrlDto: UpdateUrlDto,
  ): Promise<Url> {
    const url = await this.urlsRepository.findOne({
      where: { id, userId },
    });

    if (!url || url.deletedAt) {
      throw new NotFoundException('URL not found');
    }

    url.originalUrl = updateUrlDto.originalUrl;

    return this.urlsRepository.save(url);
  }

  async remove(id: string, userId: string): Promise<void> {
    const url = await this.urlsRepository.findOne({
      where: { id, userId },
    });

    if (!url || url.deletedAt) {
      throw new NotFoundException('URL not found');
    }

    await this.urlsRepository.softDelete(id);
  }

  getFullShortUrl(shortCode: string): string {
    const baseUrl = this.configService.get<string>('baseUrl');
    return `${baseUrl}/${shortCode}`;
  }
}
