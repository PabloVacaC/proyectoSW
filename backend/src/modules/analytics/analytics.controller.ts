// backend/src/modules/analytics/analytics.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { AcademicFilterDto } from './dto/academic-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Analítica e Inteligencia Académica')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ==========================================
  // ENDPOINTS DE INTELIGENCIA ACADÉMICA (ADMIN)
  // ==========================================

  @Get('admin/analytics/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener los 7 KPIs del resumen general académico para el administrador' })
  @ApiResponse({ status: 200, description: 'Resumen de indicadores académicos calculado con éxito' })
  async getAdminSummary(@Query() filter: AcademicFilterDto) {
    return this.analyticsService.getAdminSummary(filter);
  }

  @Get('admin/analytics/courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener análisis de cursos, demanda e inscripciones por categoría' })
  @ApiResponse({ status: 200, description: 'Métricas de cursos calculadas con éxito' })
  async getAdminCourses(@Query() filter: AcademicFilterDto) {
    return this.analyticsService.getAdminCoursesAnalytics(filter);
  }

  @Get('admin/analytics/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener ranking de preguntas difíciles y tasas de error' })
  @ApiResponse({ status: 200, description: 'Preguntas analizadas ordenadas por dificultad' })
  async getAdminQuestions(@Query() filter: AcademicFilterDto) {
    return this.analyticsService.getAdminQuestionsAnalytics(filter);
  }

  @Get('admin/analytics/topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener análisis de temas difíciles y fortalezas pedagógicas colectivas' })
  @ApiResponse({ status: 200, description: 'Temas agrupados y clasificados con éxito' })
  async getAdminTopics(@Query() filter: AcademicFilterDto) {
    return this.analyticsService.getAdminTopicsAnalytics(filter);
  }

  @Get('admin/analytics/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener listado y ranking de estudiantes (destacados vs con dificultades)' })
  @ApiResponse({ status: 200, description: 'Estudiantes categorizados con éxito' })
  async getAdminStudents(@Query() filter: AcademicFilterDto) {
    return this.analyticsService.getAdminStudentsAnalytics(filter);
  }

  @Get('admin/analytics/students/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil académico individual y trazabilidad de un estudiante' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Perfil académico individual recuperado con éxito' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  async getAdminStudentProfile(@Param('id') studentId: string) {
    return this.analyticsService.getAdminStudentProfile(studentId);
  }

  // ==========================================
  // ENDPOINTS DOCENTE MÓVIL (EXISTENTES)
  // ==========================================

  @Get('teacher/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener dashboard para el docente con 3 KPIs, semáforo pedagógico por curso y lección crítica',
  })
  @ApiResponse({ status: 200, description: 'Métricas del dashboard docente calculadas con éxito' })
  async getDashboard(@Request() req: any) {
    return this.analyticsService.getTeacherDashboard(req.user.id);
  }

  @Post('teacher/device-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar token de notificaciones push de Expo para el docente' })
  @ApiResponse({ status: 200, description: 'Token registrado exitosamente' })
  async registerToken(@Request() req: any, @Body() dto: RegisterDeviceDto) {
    return this.analyticsService.registerDeviceToken(req.user.id, dto.pushToken);
  }

  @Delete('teacher/device-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  async unregisterToken(@Request() req: any, @Body() dto: RegisterDeviceDto) {
    return this.analyticsService.unregisterDeviceToken(req.user.id, dto.pushToken);
  }
}

