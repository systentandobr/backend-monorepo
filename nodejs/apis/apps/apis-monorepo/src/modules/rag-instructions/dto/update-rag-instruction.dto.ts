import { PartialType } from '@nestjs/swagger';
import { CreateRagInstructionDto } from './create-rag-instruction.dto';

export class UpdateRagInstructionDto extends PartialType(
  CreateRagInstructionDto,
) {}
