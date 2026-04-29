import { Injectable } from '@nestjs/common';
import { Filter } from 'mongodb';
import { GetPetsFilterDto } from './dto/get-pets-filter.dto';
import { PetResponse, QueryMetrics } from './dto/pet-response.dto';
import { PetsRepository } from './repositories/pets.repository';
import { S3Service } from '../integrations/s3/s3.service';

export interface Pet {
  _id?: string;
  name: string;
  birthDate: Date;
  breed: string;
  species: string;
  adopted: boolean;
  description?: string;
  image: string;
}

@Injectable()
export class PetsService {
  constructor(
    private readonly petsRepository: PetsRepository,
    private readonly s3Service: S3Service,
  ) { }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return this.s3Service.uploadFile(file, 'pets');
  }

  async create(pet: Pet): Promise<Pet> {
    if (pet.adopted === undefined) pet.adopted = false;
    // Store species in lowercase for consistency
    if (pet.species) pet.species = pet.species.toLowerCase();
    return this.petsRepository.create(pet);
  }

  async update(id: string, updateData: Partial<Pet>): Promise<Pet | null> {
    if (updateData.species) updateData.species = updateData.species.toLowerCase();
    return this.petsRepository.update(id, updateData);
  }

  async findAll(filterDto?: GetPetsFilterDto): Promise<PetResponse> {
    const hasFilters = !!(
      filterDto?.name || 
      filterDto?.breed || 
      filterDto?.species || 
      filterDto?.adopted !== undefined || 
      filterDto?.bornAfter || 
      filterDto?.microchipNumber
    );

    if (!hasFilters) {
      return this.findAllUnfiltered(filterDto);
    }

    const useAtlasSearch = filterDto?.useAtlasSearch === true || (filterDto?.useAtlasSearch as any) === 'true';
    if (useAtlasSearch) {
      return this.findAllWithAtlasSearch(filterDto!);
    }

    return this.findAllWithMql(filterDto!);
  }

  async getUniqueBreeds(): Promise<string[]> {
    return this.petsRepository.distinctBreeds();
  }

  private getSortObject(filterDto?: GetPetsFilterDto): any {
    if (!filterDto) return null;
    const sort: any = {};
    
    // Priority: Name > Breed > BirthDate
    if (filterDto.sortName && filterDto.sortName !== 'none') {
      sort.name = filterDto.sortName === 'asc' ? 1 : -1;
    }
    if (filterDto.sortBreed && filterDto.sortBreed !== 'none') {
      sort.breed = filterDto.sortBreed === 'asc' ? 1 : -1;
    }
    if (filterDto.sortBirthDate && filterDto.sortBirthDate !== 'none') {
      sort.birthDate = filterDto.sortBirthDate === 'asc' ? 1 : -1;
    }

    return Object.keys(sort).length > 0 ? sort : null;
  }

  private async findAllUnfiltered(filterDto?: GetPetsFilterDto): Promise<PetResponse> {
    const query: Filter<Pet> = {};
    const sort = this.getSortObject(filterDto);
    const startTime = Date.now();

    const total = await this.petsRepository.count(query);
    const page = filterDto?.page ?? 1;
    const limit = filterDto?.limit ?? 20;
    const skip = (page - 1) * limit;

    const results = await this.petsRepository.findAll(query, skip, limit, sort);
    const totalLatencyMillis = Date.now() - startTime;

    const metrics: QueryMetrics = {
      query: sort ? { find: query, sort } : query,
      executionTimeMillis: '-',
      totalLatencyMillis,
      indexesUsed: '-',
      docsScanned: '-',
      docsReturned: results.length,
    };

    return { results, total, metrics };
  }

  private async findAllWithMql(filterDto: GetPetsFilterDto): Promise<PetResponse> {
    const query: Filter<Pet> = {};
    const { name, breed, species, adopted, bornAfter, microchipNumber } = filterDto;
    const sort = this.getSortObject(filterDto);

    if (name) query.name = { $regex: name, $options: 'i' };
    if (breed) query.breed = breed;
    if (species) {
      if (species === 'Other') {
        query.species = { $nin: ['dog', 'cat'] };
      } else {
        query.species = species.toLowerCase();
      }
    }
    if (adopted !== undefined) query.adopted = adopted;
    if (bornAfter) query.birthDate = { $gt: bornAfter };
    if (microchipNumber) query._id = microchipNumber as any;

    const startTime = Date.now();
    const results = await this.petsRepository.findAll(query, undefined, undefined, sort);
    const totalLatencyMillis = Date.now() - startTime;

    const explainResult = await this.petsRepository.explain(query);
    const executionStats = (explainResult as any).executionStats;
    const winningPlan = (explainResult as any).queryPlanner.winningPlan;

    const metrics: QueryMetrics = {
      query: sort ? { find: query, sort } : query,
      executionTimeMillis: executionStats.executionTimeMillis,
      totalLatencyMillis,
      indexesUsed: Array.from(new Set(this.getIndexesFromPlan(winningPlan))),
      docsScanned: (executionStats.totalDocsExamined || 0),
      docsReturned: results.length,
    };

    return { results, total: results.length, metrics };
  }

  private async findAllWithAtlasSearch(filterDto: GetPetsFilterDto): Promise<PetResponse> {
    const indexName = 'searchindex';
    const must: any[] = [];
    const mustNot: any[] = [];
    const { name, breed, species, adopted, bornAfter, microchipNumber } = filterDto;
    const sort = this.getSortObject(filterDto);

    if (name) must.push({ text: { query: name, path: 'name', fuzzy: {} } });
    if (breed) must.push({ text: { query: breed, path: 'breed' } });
    if (species) {
      if (species === 'Other') {
        mustNot.push({ text: { query: 'dog', path: 'species' } });
        mustNot.push({ text: { query: 'cat', path: 'species' } });
      } else {
        must.push({ text: { query: species.toLowerCase(), path: 'species' } });
      }
    }
    if (adopted !== undefined) must.push({ equals: { value: adopted, path: 'adopted' } });
    if (bornAfter) must.push({ range: { path: 'birthDate', gt: new Date(bornAfter) } });
    if (microchipNumber) must.push({ text: { query: microchipNumber, path: '_id' } });

    const searchStage: any = {
      $search: {
        index: indexName,
        compound: {
          must: must,
          mustNot: mustNot
        }
      }
    };

    if (sort) {
      searchStage.$search.sort = sort;
    }

    const searchPipeline: any[] = [searchStage];

    const startTime = Date.now();

    const results = await this.petsRepository.aggregate(searchPipeline)

    const totalLatencyMillis = Date.now() - startTime;

    const metrics: QueryMetrics = {
      query: searchPipeline,
      executionTimeMillis: '-',
      totalLatencyMillis,
      indexesUsed: [indexName],
      docsScanned: '-',
      docsReturned: results.length,
    };

    return { results, total: results?.length || 0, metrics };
  }

  private getIndexesFromPlan(plan: any): string[] {
    let indexes: string[] = [];
    if (plan.indexName) indexes.push(plan.indexName);
    if (plan.inputStage && typeof plan.inputStage === 'object') {
      indexes = [...indexes, ...this.getIndexesFromPlan(plan.inputStage)];
    }
    if (plan.inputStages && Array.isArray(plan.inputStages)) {
      for (const stage of plan.inputStages) {
        if (stage && typeof stage === 'object') {
          indexes = [...indexes, ...this.getIndexesFromPlan(stage)];
        }
      }
    }
    return indexes;
  }
}
