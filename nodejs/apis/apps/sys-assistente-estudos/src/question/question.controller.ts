import {
  Controller,
  Post,
  Body,
  Param,
  UploadedFile,
  Delete,
  HttpCode,
  Put,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionService } from './question.service';
import { diskStorage, Multer } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

import {
  QuestionDto,
  adapterArrayQuestionDto,
  adapterQuestionDto,
} from './model/question.dto';
import { handlerImportFileErrorMessage } from './handlers';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) { }

  @Get('simulacao/:id')
  async findAll(@Param('id') simulacaoId: string): Promise<QuestionDto[]> {
    return adapterArrayQuestionDto(
      await this.questionService.getAllRandomQuestions({ simulacaoId }),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<QuestionDto> {
    return adapterQuestionDto(await this.questionService.getQuestionById(id));
  }

  @HttpCode(201)
  @Post()
  async create(@Body() questionDto: QuestionDto): Promise<void> {
    this.questionService.createQuestion(questionDto);
  }

  @HttpCode(203)
  @Put()
  async update(@Body() question: QuestionDto): Promise<void> {
    this.questionService.updateQuestion(question._id, question);
  }

  @HttpCode(203)
  @Put('is-correct')
  async updateCorrectQuestion(
    @Body() question: QuestionDto,
  ): Promise<QuestionDto> {
    return this.questionService.updateCorrectQuestion(question._id, question);
  }

  @HttpCode(203)
  @Put('is-incorrect')
  async updateInCorrectQuestion(
    @Body() question: QuestionDto,
  ): Promise<QuestionDto> {
    return this.questionService.updateInCorrectQuestion(question._id, question);
  }

  @Post('gpt-explain')
  async explain(@Body() prompt: string): Promise<string> {
    return this.questionService.explain(prompt);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.questionService.deleteQuestion(id);
  }

  // curl -X DELETE http://localhost:3000/questions
  @Delete('/simulacao/:simulacaoId')
  deleteAll(@Param('simulacaoId') simulacaoId: string): Promise<string> {
    return this.questionService.deleteAllBySimulacaoId(simulacaoId);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp', // Diretório temporário para salvar o arquivo
        filename: (req, file, cb) => {
          const filename: string =
            path.parse(file.originalname).name.replace(/\s+/g, '_') +
            '-' +
            uuidv4();
          const extension: string = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  // curl -X POST -F "file=@/home/mcl/Downloads/SIMULADO+IFS+-+COM+GABARITO.pdf" -F "concursoId=6649a42f04ffa5b30aca922d" http://localhost:3000/questions/import
  async importQuestions(
    @UploadedFile() file: Multer.File,
    @Body() body: { simulacaoId: string },
  ): Promise<void> {
    const filePath = file.path;
    try {
      await this.questionService.importQuestionsFromPdf(
        filePath,
        body.simulacaoId,
      );
    } catch (error) {
      throw handlerImportFileErrorMessage(error);
    } finally {
      // Remove o arquivo temporário após a importação
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete temporary file: ${filePath}`, err);
        }
      });
    }
  }
}
