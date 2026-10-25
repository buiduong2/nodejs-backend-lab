import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { LogsService } from './logs.service';
import type { ApplicationLog } from './application-log.interface';

type QueryLog = {
  level?: ApplicationLog['level'];
  service?: string;
  requestId?: string;
  page?: string;
  limit?: string;
};

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() body: ApplicationLog) {
    return this.logsService.create(body);
  }

  @Get()
  findAll(@Query() query: QueryLog) {
    return this.logsService.findAll(query);
  }

  @Get('stats/levels')
  getLevelStats() {
    return this.logsService.getLevelStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ApplicationLog>,
  ) {
    return this.logsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsService.remove(id);
  }
}