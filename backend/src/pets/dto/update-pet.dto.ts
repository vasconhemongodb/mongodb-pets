import { IsString, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsBoolean()
  @IsOptional()
  adopted?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
