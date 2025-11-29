import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+212|0)[0-9]{9}$/, {
    message: 'Phone must be a valid Moroccan number (e.g., +212612345678 or 0612345678)',
  })
  phone?: string;
}
