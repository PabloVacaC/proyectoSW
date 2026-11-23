// backend/src/modules/recommendations/dto/diagnostic.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DiagnosticAnswerItemDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsNumber()
  selectedOptionIndex: number;

  @IsOptional()
  isCorrect?: boolean;
}

export class EvaluateDiagnosticDto {
  @IsUUID()
  @IsNotEmpty()
  moduleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosticAnswerItemDto)
  answers: DiagnosticAnswerItemDto[];
}
