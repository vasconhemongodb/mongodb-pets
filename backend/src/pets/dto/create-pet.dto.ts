import { IsString, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePetDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  name: string;

  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @IsString()
  breed: string;

  @IsString()
  species: string;

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
