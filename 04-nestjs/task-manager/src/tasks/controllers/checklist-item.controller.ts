import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';

import { ChecklistItemService } from '../services/checklist-item.services';
import { CreateChecklistItemDto } from '../dtos/create-checklist-item.dto';
import { UpdateChecklistItemDto } from '../dtos/update-checklist-item.dto';

@Controller('tasks/:taskId/checklists')
export class ChecklistItemController {
  constructor(
    private readonly checklistItemService: ChecklistItemService,
  ) {}

  @Post()
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateChecklistItemDto,
  ) {
    return this.checklistItemService.create(taskId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UpdateChecklistItemDto,
  ) {
    return this.checklistItemService.update(taskId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.checklistItemService.delete(taskId, id);
  }
}