import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRequestDto {
  @IsOptional()
  @IsEnum(['open', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsEnum(['online', 'presential', 'both'])
  requestType?: string;

  @IsOptional()
  @IsString()
  skill?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  minBudget?: number;

  @IsOptional()
  @Type(() => Number)
  maxBudget?: number;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
