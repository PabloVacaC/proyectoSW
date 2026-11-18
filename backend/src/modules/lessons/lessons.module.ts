// backend/src/modules/lessons/lessons.module.ts
import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  controllers: [LessonsController, CommentsController],
  providers: [LessonsService, CommentsService],
  exports: [LessonsService, CommentsService],
})
export class LessonsModule {}
