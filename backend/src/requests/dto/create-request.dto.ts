import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsEnum(['online', 'presential', 'both'])
  requestType: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;
}
