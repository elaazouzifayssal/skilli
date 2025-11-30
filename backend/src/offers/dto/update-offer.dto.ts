import { IsOptional, IsString, IsNumber, IsDateString, IsEnum, Min, MaxLength } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsDateString()
  firstAvailableDate?: string;

  @IsOptional()
  @IsEnum(['pending', 'accepted', 'rejected'])
  status?: string;
}
