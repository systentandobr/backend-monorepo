import {
  IsArray,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class SuggestTeamNameDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  studentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];
}
