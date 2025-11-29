import { IsString, IsArray, IsBoolean, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsDateString()
  date: string; // ISO date string

  @IsNumber()
  @Min(15)
  duration: number; // Duration in minutes (minimum 15 minutes)

  @IsBoolean()
  isOnline: boolean;

  @IsOptional()
  @IsString()
  location?: string; // Required if isOnline is false

  @IsNumber()
  @Min(0)
  price: number; // Price in MAD

  @IsNumber()
  @Min(1)
  maxParticipants: number;
}
