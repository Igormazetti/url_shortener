/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
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

      jest.spyOn(service, 'create').mockResolvedValue(user as unknown as User);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(user);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const id = '1';
      const user = {
        id,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(user as unknown as User);

      const result = await controller.findOne(id);

      expect(result).toEqual(user);
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });
});
