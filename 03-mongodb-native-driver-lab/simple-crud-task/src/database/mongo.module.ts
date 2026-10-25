import {
  BeforeApplicationShutdown,
  Inject,
  Module,
} from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from './mongo.constants';

@Module({
  providers: [
    {
      provide: MONGO_CLIENT,
      useFactory: async () => {
        const uri = process.env.MONGO_URI;

        if (!uri) {
          throw new Error('MONGO_URI is missing');
        }
        
        const client = new MongoClient(uri);
        await client.connect();

        return client;
      },
    },
  ],
  exports: [MONGO_CLIENT],
})
export class MongoModule implements BeforeApplicationShutdown {
  constructor(
    @Inject(MONGO_CLIENT)
    private readonly mongoClient: MongoClient,
  ) {}

  async beforeApplicationShutdown(signal?: string) {
    await this.mongoClient.close();
  }
}