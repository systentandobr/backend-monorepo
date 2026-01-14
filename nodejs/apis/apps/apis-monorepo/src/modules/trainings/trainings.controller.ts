import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post()
  create(@Body() createTrainingDto: CreateTrainingDto) {
    return this.trainingsService.create(createTrainingDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.trainingsService.findAll(query);
  }

  @Get('franchise/:franchiseId')
  findAllByFranchise(@Param('franchiseId') franchiseId: string) {
    return this.trainingsService.findAllByFranchise(franchiseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ) {
    return this.trainingsService.update(id, updateTrainingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingsService.remove(id);
  }

  @Post(':id/view')
  incrementViewCount(@Param('id') id: string) {
    return this.trainingsService.incrementViewCount(id);
  }
}
