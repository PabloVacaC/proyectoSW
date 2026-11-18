// backend/src/modules/live-meetings/live-meetings.module.ts
import { Module } from '@nestjs/common';
import { LiveMeetingsService } from './live-meetings.service';
import { LiveMeetingsController } from './live-meetings.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LiveMeetingsController],
  providers: [LiveMeetingsService],
  exports: [LiveMeetingsService],
})
export class LiveMeetingsModule {}
