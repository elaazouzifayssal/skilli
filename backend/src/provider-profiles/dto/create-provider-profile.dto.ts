import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Temara',
  'Mohammedia', 'Khouribga', 'El Jadida', 'Beni Mellal', 'Nador'
];

const EDUCATION_LEVELS = [
  'Collège', 'Lycée', 'Bac', 'Bac+1', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Bac+8'
];

export class CreateProviderProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @IsIn(MOROCCAN_CITIES, { message: 'City must be a valid Moroccan city' })
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  @IsIn(EDUCATION_LEVELS, { message: 'Level must be a valid education level' })
  level?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  photo?: string;
}
