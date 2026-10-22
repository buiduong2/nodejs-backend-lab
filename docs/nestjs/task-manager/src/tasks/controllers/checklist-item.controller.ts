import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateChecklistItemDto,
  ) {
    return this.checklistItemService.create(taskId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UpdateChecklistItemDto,
  ) {
    return this.checklistItemService.update(taskId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.checklistItemService.delete(taskId, id);
  }
}