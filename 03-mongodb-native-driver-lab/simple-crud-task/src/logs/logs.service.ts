import {
    BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';

import { Collection, MongoClient, ObjectId } from 'mongodb';

import { ApplicationLog } from './application-log.interface';
import { MONGO_CLIENT } from '../database/mongo.constants';
import { timestamp } from 'rxjs';

type QueryLog = {
  level?: ApplicationLog['level'];
  service?: string;
  requestId?: string;
  page?: string;
  limit?: string;
};

@Injectable()
export class LogsService {
  private readonly collection: Collection<ApplicationLog>;

  constructor(
    @Inject(MONGO_CLIENT)
    private readonly mongoClient: MongoClient,
  ) {
    this.collection = mongoClient
      .db('log_cli')
      .collection<ApplicationLog>('logs');
  }

  async create(log: ApplicationLog) {
    return this.collection.insertOne({
      ...log,
      timestamp: new Date(log.timestamp),
    });
  }

  async findAll(query: QueryLog) {
    const { level, service, requestId, page, limit } = query;

    const doc = {
      level,
      service,
      'mdc.requestId': requestId,
    };

    this.removeUndefinedKeyValueFromObject(doc);
    const cursor = this.collection.find(doc);
    cursor.sort({ timestamp: -1, _id: -1 });

    if (limit) {
      cursor.limit(Number(limit));
    }

    if (page && limit) {
      cursor.skip((Number(page) - 1) * Number(limit));
    }

    return cursor.toArray();
  }

  async findOne(id: string) {
    if (!ObjectId.isValid(id) || !/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new BadRequestException('Invalid ObjectId');
    }
    const result = await this.collection.findOne({ _id: new ObjectId(id) });
    if (result === null) {
      throw new NotFoundException('not found');
    }

    return result;
  }

  async update(id: string, data: Partial<ApplicationLog>) {
    const { mdc, attributes, ...restData } = data;
    const flatData = {
      ...restData,
      'mdc.requestId': mdc?.requestId,
      'mdc.traceId': mdc?.traceId,
      'mdc.userId': mdc?.userId,

      'attributes.http.method': attributes?.http?.method,
      'attributes.http.path': attributes?.http?.path,
      'attributes.http.statusCode': attributes?.http?.statusCode,
      'attributes.http.durationMs': attributes?.http?.durationMs,

      'attributes.error.code': attributes?.error?.code,
      'attributes.error.type': attributes?.error?.type,
      'attributes.error.retryable': attributes?.error?.retryable,
      'attributes.error.resolved': attributes?.error?.resolved,

      'attributes.tags': attributes?.tags,
      timestamp: data.timestamp ? new Date(data.timestamp) : undefined,
    };

    this.removeUndefinedKeyValueFromObject(flatData);

    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: flatData },
    );

    if (result.matchedCount === 1) {
      return this.findOne(id);
    }
    throw new NotFoundException('Not Found');
  }

  private removeUndefinedKeyValueFromObject(obj: any) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    });
  }

  async remove(id: string) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      return;
    } else {
      throw new NotFoundException('Not Found');
    }
  }

  async getLevelStats() {
    return this.collection
      .aggregate([
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
  }
}
