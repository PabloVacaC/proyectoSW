// backend/src/modules/recommendations/recommendations.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { EvaluateDiagnosticDto } from './dto/diagnostic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Recomendaciones y Rutas Adaptativas')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('quiz')
  @ApiOperation({ summary: 'Obtener cuestionario opcional de recomendación inicial (gratuito)' })
  @ApiResponse({ status: 200, description: 'Cuestionario de 3 a 5 preguntas retornado con éxito' })
  async getQuiz() {
    return this.recommendationsService.getQuiz();
  }

  @Post('quiz/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar respuestas del cuestionario y compilar ruta adaptativa (costo 0 créditos)' })
  @ApiResponse({ status: 201, description: 'Ruta compilada e inscripción automática con botón de redirección' })
  async submitQuiz(@Request() req: any, @Body() dto: SubmitQuizDto) {
    return this.recommendationsService.submitQuiz(req.user.id, dto);
  }

  @Get('modules')
  @ApiOperation({ summary: 'Listar módulos disponibles del catálogo curricular para diagnóstico inteligente (RF-1)' })
  @ApiResponse({ status: 200, description: 'Módulos activos con información de lecciones' })
  async getAvailableModules() {
    return this.recommendationsService.getAvailableModules();
  }

  @Get('diagnostic/:moduleId')
  @ApiOperation({ summary: 'Generar examen de diagnóstico inteligente con IA para un módulo (RF-2 a RF-8)' })
  @ApiResponse({ status: 200, description: 'Preguntas contextualizadas con lecciones reales del módulo' })
  async generateModuleDiagnostic(@Param('moduleId') moduleId: string) {
    return this.recommendationsService.generateModuleDiagnostic(moduleId);
  }

  @Post('diagnostic/evaluate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Evaluar diagnóstico, categorizar conocimientos dominados/pendientes y recomendar lección (RF-9 a RF-17)' })
  @ApiResponse({ status: 201, description: 'Evaluación y recomendación pedagógica personalizada (0 créditos)' })
  async evaluateModuleDiagnostic(@Request() req: any, @Body() dto: EvaluateDiagnosticDto) {
    return this.recommendationsService.evaluateModuleDiagnostic(req.user.id, dto);
  }
}

