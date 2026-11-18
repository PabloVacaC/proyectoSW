// backend/src/modules/live-meetings/dto/update-live-meeting.dto.ts
import { IsString, IsOptional, IsUUID, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLiveMeetingDto {
  @ApiPropertyOptional({ description: 'ID del curso al que pertenece la reunión' })
  @IsOptional()
  @IsUUID('4', { message: 'El courseId debe ser un UUID versión 4 válido' })
  courseId?: string;

  @ApiPropertyOptional({ description: 'Título identificador de la reunión' })
  @IsOptional()
  @IsString({ message: 'El título debe ser texto' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  title?: string;

  @ApiPropertyOptional({ description: 'Fecha de la reunión en formato YYYY-MM-DD' })
  @IsOptional()
  @IsString({ message: 'La fecha debe ser un string en formato YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ description: 'Hora de inicio en formato HH:mm' })
  @IsOptional()
  @IsString({ message: 'La hora de inicio debe ser un string' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora de inicio debe tener el formato HH:mm (24 horas)' })
  startTime?: string;

  @ApiPropertyOptional({ description: 'Hora estimada de finalización en formato HH:mm' })
  @IsOptional()
  @IsString({ message: 'La hora de finalización debe ser un string' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora de finalización debe tener el formato HH:mm (24 horas)' })
  endTime?: string;

  @ApiPropertyOptional({ description: 'Enlace seguro de la videoconferencia' })
  @IsOptional()
  @IsString({ message: 'El enlace de reunión debe ser una URL válida' })
  @Matches(/^https:\/\/.+/i, { message: 'El enlace debe utilizar el protocolo seguro https://' })
  meetingUrl?: string;

  @ApiPropertyOptional({ description: 'Descripción detallada o agenda de los temas que se desarrollarán' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MinLength(5, { message: 'La descripción debe contener al menos 5 caracteres' })
  description?: string;
}
