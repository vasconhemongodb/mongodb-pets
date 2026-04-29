import { Injectable, Inject } from '@nestjs/common';
import { Db, Collection, Filter, ObjectId } from 'mongodb';
import { Pet } from '../pets.service';

@Injectable()
export class PetsRepository {
  private collection: Collection<Pet>;

  constructor(@Inject('MONGODB_CONNECTION') private db: Db) {
    this.collection = this.db.collection<Pet>('dogs');
  }

  async create(pet: Pet): Promise<Pet> {
    const result = await this.collection.insertOne(pet);
    return { ...pet, _id: pet._id || result.insertedId.toString() } as Pet;
  }

  async findById(id: string): Promise<Pet | null> {
    const result = await this.collection.findOne({ _id: id as any });
    return result as Pet | null;
  }

  async update(id: string, updateData: Partial<Pet>): Promise<Pet | null> {
    const { _id, ...data } = updateData;
    const result = await this.collection.findOneAndUpdate(
      { _id: id as any },
      { $set: data },
      { returnDocument: 'after' }
    );
    return result as unknown as Pet;
  }

  async findAll(query: Filter<Pet>, skip?: number, limit?: number, sort?: any): Promise<Pet[]> {
    let cursor = this.collection.find(query);
    if (sort) cursor = cursor.sort(sort);
    if (skip !== undefined) cursor = cursor.skip(skip);
    if (limit !== undefined) cursor = cursor.limit(limit);
    return cursor.toArray();
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.collection.aggregate(pipeline).toArray();
  }

  async count(query: Filter<Pet>): Promise<number> {
    return this.collection.countDocuments(query);
  }

  async explain(query: Filter<Pet>): Promise<any> {
    return this.collection.find(query).explain('executionStats');
  }

  async explainAggregation(pipeline: any[]): Promise<any> {
    return this.collection.aggregate(pipeline).explain('executionStats');
  }

  async distinctBreeds(): Promise<string[]> {
    return this.collection.distinct('breed');
  }
}
