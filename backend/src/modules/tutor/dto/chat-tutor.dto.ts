// backend/src/modules/tutor/dto/chat-tutor.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatTutorDto {
  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  audioBase64?: string;
}
