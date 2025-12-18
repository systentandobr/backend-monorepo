import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RagInstructionsService } from './rag-instructions.service';
import { RagInstructionsController } from './rag-instructions.controller';
import { RagInstruction, RagInstructionSchema } from './schemas/rag-instruction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RagInstruction.name, schema: RagInstructionSchema }
    ]),
  ],
  controllers: [RagInstructionsController],
  providers: [RagInstructionsService],
  exports: [RagInstructionsService],
})
export class RagInstructionsModule {}
