// backend/src/modules/lessons/dto/create-comment.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Contenido del comentario o duda pedagógica',
    example: '¿Cómo funciona la recursión en casos base múltiples?',
  })
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MinLength(2, { message: 'El comentario debe tener al menos 2 caracteres' })
  @MaxLength(2000, { message: 'El comentario no puede exceder 2000 caracteres' })
  content: string;

  @ApiPropertyOptional({
    description: 'ID del comentario padre si es una respuesta anidada',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El parentId debe ser un UUID válido' })
  parentId?: string;
}
