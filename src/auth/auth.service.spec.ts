/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    // Resetar os mocks antes de cada teste
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        id: '1',
        name: 'Test User',
        email,
        password: 'hashedPassword',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        urls: user.urls,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      };

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(user as unknown as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(userWithoutPassword);
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      // Garantir que o mock de bcrypt.compare está limpo
      (bcrypt.compare as jest.Mock).mockClear();

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = {
        id: '1',
        name: 'Test User',
        email,
        password: 'hashedPassword',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(user as unknown as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      const token = 'jwt-token';
      const payload = { sub: user.id, email: user.email };
      const expectedResult = {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.login(user);

      expect(result).toEqual(expectedResult);
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });
});
