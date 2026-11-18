// backend/src/modules/live-meetings/dto/create-live-meeting.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsUrl, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveMeetingDto {
  @ApiProperty({ description: 'ID del curso al que pertenece la reunión' })
  @IsUUID('4', { message: 'El courseId debe ser un UUID versión 4 válido' })
  @IsNotEmpty({ message: 'El curso es obligatorio' })
  courseId: string;

  @ApiProperty({ description: 'Título identificador de la reunión', example: 'Clase en vivo: Fundamentos de Bases de Datos' })
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título de la reunión es obligatorio' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  title: string;

  @ApiProperty({ description: 'Fecha de la reunión en formato YYYY-MM-DD', example: '2026-12-01' })
  @IsString({ message: 'La fecha debe ser un string en formato YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  date: string;

  @ApiProperty({ description: 'Hora de inicio en formato HH:mm', example: '19:00' })
  @IsString({ message: 'La hora de inicio debe ser un string' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora de inicio debe tener el formato HH:mm (24 horas)' })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  startTime: string;

  @ApiProperty({ description: 'Hora estimada de finalización en formato HH:mm', example: '20:30' })
  @IsString({ message: 'La hora de finalización debe ser un string' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora de finalización debe tener el formato HH:mm (24 horas)' })
  @IsNotEmpty({ message: 'La hora de finalización es obligatoria' })
  endTime: string;

  @ApiProperty({ description: 'Enlace seguro de la videoconferencia', example: 'https://meet.google.com/abc-defg-hij' })
  @IsString({ message: 'El enlace de reunión debe ser una URL válida' })
  @IsNotEmpty({ message: 'El enlace de reunión es obligatorio' })
  @Matches(/^https:\/\/.+/i, { message: 'El enlace debe utilizar el protocolo seguro https://' })
  meetingUrl: string;

  @ApiProperty({
    description: 'Descripción detallada o agenda de los temas que se desarrollarán',
    example: 'Durante esta reunión estudiaremos:\n- Introducción a las bases de datos\n- Modelo entidad-relación',
  })
  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción o agenda de la reunión es obligatoria' })
  @MinLength(5, { message: 'La descripción debe contener al menos 5 caracteres' })
  description: string;
}
