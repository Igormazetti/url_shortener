/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { User } from '../users/entities/user.entity';
import { Url } from './entities/url.entity';

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

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: UrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByShortCode: jest.fn(),
            incrementClicks: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getFullShortUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    service = module.get<UrlsService>(UrlsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a URL with authenticated user', async () => {
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
        originalUrl: createUrlDto.originalUrl,
        shortCode: 'abc123',
        clicks: 0,
        user: mockUser,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const shortUrl = 'http://localhost:3000/abc123';

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockUrl as unknown as Url);
      jest.spyOn(service, 'getFullShortUrl').mockReturnValue(shortUrl);

      const result = await controller.create(createUrlDto, {
        user: mockUser as unknown as User,
      } as any);

      expect(result).toEqual({
        originalUrl: mockUrl.originalUrl,
        shortUrl,
        shortCode: mockUrl.shortCode,
      });
      expect(service.create).toHaveBeenCalledWith(
        createUrlDto,
        mockUser as unknown as User,
      );
      expect(service.getFullShortUrl).toHaveBeenCalledWith(mockUrl.shortCode);
    });

    it('should create a URL without authenticated user', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
      };

      const mockUser: MockUser = {
        id: '',
        email: '',
        name: '',
        password: '',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockUrl: MockUrl = {
        id: '1',
        originalUrl: createUrlDto.originalUrl,
        shortCode: 'abc123',
        clicks: 0,
        user: undefined,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const shortUrl = 'http://localhost:3000/abc123';

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockUrl as unknown as Url);
      jest.spyOn(service, 'getFullShortUrl').mockReturnValue(shortUrl);

      const result = await controller.create(createUrlDto, {
        user: undefined,
      } as any);

      expect(result).toEqual({
        originalUrl: mockUrl.originalUrl,
        shortUrl,
        shortCode: mockUrl.shortCode,
      });
      expect(service.create).toHaveBeenCalledWith(createUrlDto, undefined);
      expect(service.getFullShortUrl).toHaveBeenCalledWith(mockUrl.shortCode);
    });
  });

  describe('findAll', () => {
    it('should return all URLs for authenticated user', async () => {
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

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(mockUrls as unknown as Url[]);

      const result = await controller.findAll({
        user: mockUser as unknown as User,
      } as any);

      expect(result).toEqual(mockUrls);
      expect(service.findAll).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user is not authenticated', async () => {
      try {
        await controller.findAll({ user: undefined } as any);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('User not authenticated');
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

      const mockUpdatedUrl: MockUrl = {
        id,
        originalUrl: updateUrlDto.originalUrl,
        shortCode: 'abc123',
        clicks: 0,
        user: mockUser,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(service, 'update')
        .mockResolvedValue(mockUpdatedUrl as unknown as Url);

      const result = await controller.update(id, updateUrlDto, {
        user: mockUser as unknown as User,
      } as any);

      expect(result).toEqual(mockUpdatedUrl);
      expect(service.update).toHaveBeenCalledWith(id, userId, updateUrlDto);
    });

    it('should throw error if user is not authenticated', async () => {
      const id = '1';
      const updateUrlDto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };

      try {
        await controller.update(id, updateUrlDto, { user: undefined } as any);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('User not authenticated');
      }
    });
  });

  describe('remove', () => {
    it('should remove a URL', async () => {
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

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(id, { user: mockUser as unknown as User } as any);

      expect(service.remove).toHaveBeenCalledWith(id, userId);
    });

    it('should throw error if user is not authenticated', async () => {
      const id = '1';

      try {
        await controller.remove(id, { user: undefined } as any);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('User not authenticated');
      }
    });
  });

  describe('redirect', () => {
    it('should redirect to original URL and increment clicks', async () => {
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
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(service, 'findByShortCode')
        .mockResolvedValue(mockUrl as unknown as Url);
      jest.spyOn(service, 'incrementClicks').mockResolvedValue(undefined);

      await controller.redirect(shortCode, res);

      expect(service.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(service.incrementClicks).toHaveBeenCalledWith(mockUrl.id);
      expect(res.redirect).toHaveBeenCalledWith(301, mockUrl.originalUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      const shortCode = 'nonexistent';
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(service, 'findByShortCode')
        .mockRejectedValue(
          new NotFoundException(`URL with short code ${shortCode} not found`),
        );

      await expect(controller.redirect(shortCode, res)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
