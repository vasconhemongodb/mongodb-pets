import { Module, Global } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'MONGODB_CONNECTION',
      useFactory: async (configService: ConfigService): Promise<Db> => {
        try {
          const uri = configService.get<string>('MONGODB_URI')!;
          const dbName = configService.get<string>('MONGODB_DB_NAME')!;
          const client = await MongoClient.connect(uri);
          return client.db(dbName);
        } catch (e) {
          throw e;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MONGODB_CONNECTION'],
})
export class DatabaseModule {}
