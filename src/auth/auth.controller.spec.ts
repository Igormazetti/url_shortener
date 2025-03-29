/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

// Importar a interface RequestWithUser do controller
// Precisamos estender a interface Request do Express para incluir a propriedade user
interface RequestWithUser extends Request {
  user: Omit<User, 'password'>;
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const token = {
        access_token: 'jwt-token',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };

      jest.spyOn(service, 'login').mockResolvedValue(token);

      // Criar um mock do objeto RequestWithUser que estende Request
      const mockRequest = {
        user,
        // Adicionar propriedades mínimas necessárias do Express.Request
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        acceptsCharsets: jest.fn(),
        acceptsEncodings: jest.fn(),
        acceptsLanguages: jest.fn(),
        range: jest.fn(),
        // ... outras propriedades necessárias
      } as unknown as RequestWithUser;

      const result = await controller.login(mockRequest);

      expect(result).toEqual(token);
      expect(service.login).toHaveBeenCalledWith(user);
    });
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        id: '1',
        name: createUserDto.name,
        email: createUserDto.email,
        password: 'hashedPassword',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const token = {
        access_token: 'jwt-token',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };

      jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(user as unknown as User);
      jest.spyOn(service, 'login').mockResolvedValue(token);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(token);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(service.login).toHaveBeenCalledWith(user);
    });
  });
});
