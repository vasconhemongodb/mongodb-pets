import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetsRepository } from './repositories/pets.repository';
import { S3Module } from '../integrations/s3/s3.module';

@Module({
  imports: [ConfigModule, S3Module],
  controllers: [PetsController],
  providers: [PetsService, PetsRepository],
})
export class PetsModule {}
