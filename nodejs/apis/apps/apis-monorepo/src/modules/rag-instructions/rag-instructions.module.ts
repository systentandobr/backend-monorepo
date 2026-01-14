import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RagInstructionsService } from './rag-instructions.service';
import { RagInstructionsController } from './rag-instructions.controller';
import {
  RagInstruction,
  RagInstructionSchema,
} from './schemas/rag-instruction.schema';
import { UrlContentProcessorService } from './services/url-content-processor.service';
import { PdfContentProcessorService } from './services/pdf-content-processor.service';
import { RagIndexingService } from './services/rag-indexing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RagInstruction.name, schema: RagInstructionSchema },
    ]),
  ],
  controllers: [RagInstructionsController],
  providers: [
    RagInstructionsService,
    UrlContentProcessorService,
    PdfContentProcessorService,
    RagIndexingService,
  ],
  exports: [RagInstructionsService],
})
export class RagInstructionsModule {}
