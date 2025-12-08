import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskTemplatesService } from './task-templates.service';
import { CreateTaskTemplateDto } from './dto/create-task-template.dto';
import { UpdateTaskTemplateDto } from './dto/update-task-template.dto';

@Controller('task-templates')
export class TaskTemplatesController {
    constructor(private readonly taskTemplatesService: TaskTemplatesService) { }

    @Post()
    create(@Body() createTaskTemplateDto: CreateTaskTemplateDto) {
        return this.taskTemplatesService.create(createTaskTemplateDto);
    }

    @Get()
    findAll() {
        return this.taskTemplatesService.findAll();
    }

    @Get('defaults')
    findDefaults() {
        return this.taskTemplatesService.findDefaults();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.taskTemplatesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskTemplateDto: UpdateTaskTemplateDto) {
        return this.taskTemplatesService.update(id, updateTaskTemplateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.taskTemplatesService.remove(id);
    }
}
