import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './dogs.service';
import { ConfigService } from '@nestjs/config';
import { Db, Collection } from 'mongodb';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('PetsService', () => {
  let service: PetsService;
  let db: Db;
  let collection: Collection;

  const mockDb = {
    collection: jest.fn().mockReturnValue({
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        explain: jest.fn().mockResolvedValue({
          queryPlanner: {
            winningPlan: {
              stage: 'COLLSCAN',
            },
          },
          executionStats: {
            executionTimeMillis: 5,
            totalKeysExamined: 0,
            totalDocsExamined: 10,
            nReturned: 0,
          },
        }),
      }),
      insertOne: jest.fn(),
    }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'AWS_REGION') return 'us-east-1';
      if (key === 'AWS_S3_BUCKET') return 'test-bucket';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: 'MONGODB_CONNECTION', useValue: mockDb },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
    db = module.get<Db>('MONGODB_CONNECTION');
    collection = db.collection('dogs');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call collection.find with filters and return metrics and total', async () => {
      const filters = { name: 'Rex', breed: 'Labrador', bornAfter: new Date('2020-01-01'), page: 1, limit: 15 };
      const response = await service.findAll(filters);

      expect(collection.find).toHaveBeenCalledWith({
        name: 'Rex',
        breed: 'Labrador',
        birthDate: { $gt: filters.bornAfter },
      });

      expect(response).toHaveProperty('results');
      expect(response).toHaveProperty('total'); // Check for total field
      expect(response).toHaveProperty('metrics');
      expect(response.metrics.executionTimeMillis).toBe(5);
      expect(response.total).toBe(0); // Assuming total is 0 based on mock
    });

    it('should call collection.find with empty query if no filters provided', async () => {
      await service.findAll();
      expect(collection.find).toHaveBeenCalledWith({});
    });
  });
});
