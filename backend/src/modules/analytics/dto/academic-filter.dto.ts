// backend/src/modules/analytics/dto/academic-filter.dto.ts
import { IsOptional, IsString, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AcademicFilterDto {
  @ApiPropertyOptional({ description: 'Fecha de inicio (ISO 8601)', example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601({}, { message: 'startDate debe ser una fecha ISO 8601 válida' })
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (ISO 8601)', example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsISO8601({}, { message: 'endDate debe ser una fecha ISO 8601 válida' })
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de curso específico' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de categoría curricular' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
