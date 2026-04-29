import { IsString, IsOptional, IsDate, IsInt, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetPetsFilterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  adopted?: boolean;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  bornAfter?: Date;

  @IsString()
  @IsOptional()
  microchipNumber?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 15;

  @IsOptional()
  useAtlasSearch?: boolean;

  @IsString()
  @IsOptional()
  sortName?: 'asc' | 'desc' | 'none';

  @IsString()
  @IsOptional()
  sortBreed?: 'asc' | 'desc' | 'none';

  @IsString()
  @IsOptional()
  sortBirthDate?: 'asc' | 'desc' | 'none';
}
