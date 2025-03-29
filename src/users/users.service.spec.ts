import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword';
      const user = {
        id: '1',
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      if (
        userRepository.findOne &&
        userRepository.create &&
        userRepository.save
      ) {
        userRepository.findOne.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        userRepository.create.mockReturnValue(user as unknown as User);
        userRepository.save.mockResolvedValue(user as unknown as User);

        const result = await service.create(createUserDto);

        expect(result).toEqual(user);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { email: createUserDto.email },
        });
        expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
        expect(userRepository.create).toHaveBeenCalledWith({
          ...createUserDto,
          password: hashedPassword,
        });
        expect(userRepository.save).toHaveBeenCalledWith(user);
      } else {
        fail('Repository methods are undefined');
      }
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };
      const existingUser = {
        id: '1',
        name: 'Existing User',
        email: createUserDto.email,
        password: 'hashedPassword',
        urls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      if (userRepository.findOne) {
        userRepository.findOne.mockResolvedValue(
          existingUser as unknown as User,
        );

        await expect(service.create(createUserDto)).rejects.toThrow(
          ConflictException,
        );
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { email: createUserDto.email },
        });
      } else {
        fail('userRepository.findOne is undefined');
      }
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
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

      if (userRepository.findOne) {
        userRepository.findOne.mockResolvedValue(user as unknown as User);

        const result = await service.findByEmail(email);

        expect(result).toEqual(user);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { email },
        });
      } else {
        fail('userRepository.findOne is undefined');
      }
    });

    it('should return null if user not found by email', async () => {
      const email = 'nonexistent@example.com';

      if (userRepository.findOne) {
        userRepository.findOne.mockResolvedValue(null);

        const result = await service.findByEmail(email);

        expect(result).toBeNull();
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { email },
        });
      } else {
        fail('userRepository.findOne is undefined');
      }
    });
  });

  describe('findById', () => {
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

      if (userRepository.findOne) {
        userRepository.findOne.mockResolvedValue(user as unknown as User);

        const result = await service.findById(id);

        expect(result).toEqual(user);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { id },
        });
      } else {
        fail('userRepository.findOne is undefined');
      }
    });

    it('should throw NotFoundException if user not found by id', async () => {
      const id = 'nonexistent';

      if (userRepository.findOne) {
        userRepository.findOne.mockResolvedValue(null);

        await expect(service.findById(id)).rejects.toThrow(NotFoundException);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { id },
        });
      } else {
        fail('userRepository.findOne is undefined');
      }
    });
  });
});
