import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { Request as ExpressRequest } from 'express';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

type UserWithoutPassword = Omit<User, 'password'>;

interface RequestWithUser extends ExpressRequest {
  user?: UserWithoutPassword;
}

@ApiTags('urls')
@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('urls')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Criar uma URL encurtada' })
  @ApiBody({ type: CreateUrlDto })
  @ApiCreatedResponse({
    description: 'URL encurtada criada com sucesso',
    schema: {
      properties: {
        originalUrl: {
          type: 'string',
          example: 'https://exemplo.com/pagina-longa',
        },
        shortUrl: { type: 'string', example: 'http://localhost:3000/abc123' },
        shortCode: { type: 'string', example: 'abc123' },
      },
    },
  })
  async create(
    @Body() createUrlDto: CreateUrlDto,
    @Request() req: RequestWithUser,
  ) {
    const url = await this.urlsService.create(createUrlDto, req.user as User);
    return {
      originalUrl: url.originalUrl,
      shortUrl: this.urlsService.getFullShortUrl(url.shortCode),
      shortCode: url.shortCode,
    };
  }

  @Get('urls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as URLs do usuário autenticado' })
  @ApiOkResponse({ description: 'Lista de URLs retornada com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  findAll(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.urlsService.findAll(req.user.id);
  }

  @Patch('urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar uma URL' })
  @ApiParam({ name: 'id', description: 'ID da URL' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiOkResponse({ description: 'URL atualizada com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({ description: 'URL não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req: RequestWithUser,
  ) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.urlsService.update(id, req.user.id, updateUrlDto);
  }

  @Delete('urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover uma URL' })
  @ApiParam({ name: 'id', description: 'ID da URL' })
  @ApiOkResponse({ description: 'URL removida com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({ description: 'URL não encontrada' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.urlsService.remove(id, req.user.id);
  }

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirecionar para a URL original' })
  @ApiParam({ name: 'shortCode', description: 'Código curto da URL' })
  @ApiResponse({
    status: 301,
    description: 'Redirecionado para a URL original',
  })
  @ApiNotFoundResponse({ description: 'URL curta não encontrada' })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    try {
      const url = await this.urlsService.findByShortCode(shortCode);

      if (!url) {
        throw new NotFoundException('Short URL not found');
      }

      await this.urlsService.incrementClicks(url.id);

      console.log(
        `Redirecting to ${url.originalUrl} and incrementing clicks for URL ID: ${url.id}`,
      );

      return res.redirect(HttpStatus.MOVED_PERMANENTLY, url.originalUrl);
    } catch (error) {
      console.error('Error during redirection:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        'Short URL not found or error processing redirect',
      );
    }
  }
}
