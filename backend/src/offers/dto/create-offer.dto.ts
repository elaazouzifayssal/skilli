import { IsNotEmpty, IsString, IsUUID, IsNumber, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsUUID()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsDateString()
  firstAvailableDate?: string;
}
