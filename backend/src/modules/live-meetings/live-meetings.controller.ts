// backend/src/modules/live-meetings/live-meetings.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LiveMeetingsService } from './live-meetings.service';
import { CreateLiveMeetingDto } from './dto/create-live-meeting.dto';
import { UpdateLiveMeetingDto } from './dto/update-live-meeting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reuniones en Vivo por Curso')
@Controller('meetings')
export class LiveMeetingsController {
  constructor(private readonly liveMeetingsService: LiveMeetingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Programar una nueva reunión en vivo para un curso asignado' })
  @ApiResponse({ status: 201, description: 'Reunión programada exitosamente' })
  async create(@Request() req: any, @Body() dto: CreateLiveMeetingDto) {
    return this.liveMeetingsService.create(req.user.id, dto);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Consultar las reuniones en vivo de un curso (Requiere inscripción para estudiantes o ser docente)',
  })
  async findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string, @Request() req: any) {
    return this.liveMeetingsService.findByCourse(courseId, req.user.id, req.user.role);
  }

  @Get('teacher')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las reuniones creadas y gestionadas por el docente' })
  async findByTeacher(@Request() req: any) {
    return this.liveMeetingsService.findByTeacher(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar detalles completos de una reunión específica' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.liveMeetingsService.findOne(id, req.user.id, req.user.role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modificar los datos de una reunión programada (Solo el docente creador)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: UpdateLiveMeetingDto,
  ) {
    return this.liveMeetingsService.update(id, req.user.id, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar una reunión programada' })
  async cancel(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.liveMeetingsService.cancel(id, req.user.id);
  }
}
