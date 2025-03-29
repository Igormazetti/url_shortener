/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { Url } from './entities/url.entity';
import { User } from '../users/entities/user.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  increment: jest.fn(),
  softDelete: jest.fn(),
});

interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  urls: any[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MockUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  user: MockUser | undefined;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

describe('UrlsService', () => {
  let service: UrlsService;
  let urlRepository: MockRepository<Url>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useValue: createMockRepository(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'baseUrl') return 'http://localhost:3000';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlRepository = module.get<MockRepository<Url>>(getRepositoryToken(Url));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new URL with a user', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
      };
      const mockUser: MockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockUrl: MockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 0,
        user: mockUser,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      if (urlRepository.create && urlRepository.save) {
        urlRepository.create.mockReturnValue(mockUrl as unknown as Url);
        urlRepository.save.mockResolvedValue(mockUrl as unknown as Url);

        const result = await service.create(
          createUrlDto,
          mockUser as unknown as User,
        );

        expect(result).toEqual(mockUrl);
        expect(urlRepository.create).toHaveBeenCalledWith({
          originalUrl: createUrlDto.originalUrl,
          shortCode: expect.any(String),
          user: mockUser,
          userId: mockUser.id,
        });
        expect(urlRepository.save).toHaveBeenCalledWith(mockUrl);
      } else {
        fail('urlRepository.create or urlRepository.save is undefined');
      }
    });

    it('should create a URL without a user', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
      };

      const mockUrl: MockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 0,
        user: undefined,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      if (urlRepository.create && urlRepository.save) {
        urlRepository.create.mockReturnValue(mockUrl as unknown as Url);
        urlRepository.save.mockResolvedValue(mockUrl as unknown as Url);

        const result = await service.create(createUrlDto);

        expect(result).toEqual(mockUrl);
        expect(urlRepository.create).toHaveBeenCalledWith({
          originalUrl: createUrlDto.originalUrl,
          shortCode: expect.any(String),
          user: undefined,
          userId: undefined,
        });
        expect(urlRepository.save).toHaveBeenCalledWith(mockUrl);
      } else {
        fail('urlRepository.create or urlRepository.save is undefined');
      }
    });
  });

  describe('findAll', () => {
    it('should return all URLs for a user', async () => {
      const userId = '1';
      const mockUser: MockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockUrls: MockUrl[] = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          shortCode: 'abc123',
          clicks: 0,
          user: mockUser,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: '2',
          originalUrl: 'https://example.org',
          shortCode: 'def456',
          clicks: 5,
          user: mockUser,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      if (urlRepository.find) {
        urlRepository.find.mockResolvedValue(mockUrls as unknown as Url[]);

        const result = await service.findAll(userId);

        expect(result).toEqual(mockUrls);
        expect(urlRepository.find).toHaveBeenCalledWith({
          where: { userId },
          order: { createdAt: 'DESC' },
        });
      } else {
        fail('urlRepository.find is undefined');
      }
    });
  });

  describe('findByShortCode', () => {
    it('should return a URL by short code', async () => {
      const shortCode = 'abc123';
      const mockUser: MockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockUrl: MockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode,
        clicks: 0,
        user: mockUser,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      if (urlRepository.findOne) {
        urlRepository.findOne.mockResolvedValue(mockUrl as unknown as Url);

        const result = await service.findByShortCode(shortCode);

        expect(result).toEqual(mockUrl);
        expect(urlRepository.findOne).toHaveBeenCalledWith({
          where: { shortCode },
        });
      } else {
        fail('urlRepository.findOne is undefined');
      }
    });

    it('should throw NotFoundException if URL not found', async () => {
      const shortCode = 'nonexistent';
      if (urlRepository.findOne) {
        urlRepository.findOne.mockResolvedValue(null);

        await expect(service.findByShortCode(shortCode)).rejects.toThrow(
          NotFoundException,
        );
        expect(urlRepository.findOne).toHaveBeenCalledWith({
          where: { shortCode },
        });
      } else {
        fail('urlRepository.findOne is undefined');
      }
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks for a URL', async () => {
      const id = '1';
      if (urlRepository.increment) {
        urlRepository.increment.mockResolvedValue({ affected: 1 });

        await service.incrementClicks(id);

        expect(urlRepository.increment).toHaveBeenCalledWith(
          { id },
          'clicks',
          1,
        );
      } else {
        fail('urlRepository.increment is undefined');
      }
    });
  });

  describe('update', () => {
    it('should update a URL', async () => {
      const id = '1';
      const userId = '1';
      const updateUrlDto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };

      const mockUser: MockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockUrl: MockUrl = {
        id,
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 0,
        user: mockUser,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockUpdatedUrl: MockUrl = {
        ...mockUrl,
        originalUrl: updateUrlDto.originalUrl,
      };

      if (urlRepository.findOne && urlRepository.save) {
        urlRepository.findOne.mockResolvedValue(mockUrl as unknown as Url);
        urlRepository.save.mockResolvedValue(mockUpdatedUrl as unknown as Url);

        const result = await service.update(id, userId, updateUrlDto);

        expect(result).toEqual(mockUpdatedUrl);
        expect(urlRepository.findOne).toHaveBeenCalledWith({
          where: { id, userId },
        });
        expect(urlRepository.save).toHaveBeenCalledWith({
          ...mockUrl,
          originalUrl: updateUrlDto.originalUrl,
        });
      } else {
        fail('urlRepository.findOne or urlRepository.save is undefined');
      }
    });

    it('should throw NotFoundException if URL not found', async () => {
      const id = '1';
      const userId = '1';
      const updateUrlDto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };

      if (urlRepository.findOne) {
        urlRepository.findOne.mockResolvedValue(null);

        await expect(service.update(id, userId, updateUrlDto)).rejects.toThrow(
          NotFoundException,
        );
        expect(urlRepository.findOne).toHaveBeenCalledWith({
          where: { id, userId },
        });
      } else {
        fail('urlRepository.findOne is undefined');
      }
    });
  });

  describe('remove', () => {
    it('should soft delete a URL', async () => {
      const id = '1';
      const userId = '1';

      const mockUser: MockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockUrl: MockUrl = {
        id,
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 0,
        user: mockUser,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      if (urlRepository.findOne && urlRepository.softDelete) {
        urlRepository.findOne.mockResolvedValue(mockUrl as unknown as Url);
        urlRepository.softDelete.mockResolvedValue({ affected: 1 });

        await service.remove(id, userId);

        expect(urlRepository.findOne).toHaveBeenCalledWith({
          where: { id, userId },
        });
        expect(urlRepository.softDelete).toHaveBeenCalledWith(id);
      } else {
        fail('urlRepository.findOne or urlRepository.softDelete is undefined');
      }
    });

    it('should throw NotFoundException if URL not found', async () => {
      const id = '1';
      const userId = '1';

      if (urlRepository.findOne) {
        urlRepository.findOne.mockResolvedValue(null);

        await expect(service.remove(id, userId)).rejects.toThrow(
          NotFoundException,
        );
        expect(urlRepository.findOne).toHaveBeenCalledWith({
          where: { id, userId },
        });
      } else {
        fail('urlRepository.findOne is undefined');
      }
    });
  });

  describe('getFullShortUrl', () => {
    it('should return the full short URL', () => {
      const shortCode = 'abc123';
      const baseUrl = 'http://localhost:3000';

      jest.spyOn(configService, 'get').mockReturnValue(baseUrl);

      const result = service.getFullShortUrl(shortCode);

      expect(result).toEqual(`${baseUrl}/${shortCode}`);
      expect(configService.get).toHaveBeenCalledWith('baseUrl');
    });
  });
});
