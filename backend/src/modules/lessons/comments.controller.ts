// backend/src/modules/lessons/comments.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Comentarios de Lecciones')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('lessons/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener los comentarios e hilos de respuesta de una lección' })
  @ApiResponse({ status: 200, description: 'Listado de comentarios con sus respuestas y autores' })
  async getComments(@Param('id', ParseUUIDPipe) lessonId: string) {
    return this.commentsService.findAllByLesson(lessonId);
  }

  @Post('lessons/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publicar un nuevo comentario o responder a uno existente' })
  @ApiResponse({ status: 201, description: 'Comentario creado exitosamente' })
  async createComment(
    @Param('id', ParseUUIDPipe) lessonId: string,
    @Request() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(lessonId, req.user.id, dto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un comentario (autor o rol ADMIN)' })
  @ApiResponse({ status: 200, description: 'Comentario eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'No autorizado para eliminar este comentario' })
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.commentsService.remove(id, req.user.id, req.user.role);
  }
}
