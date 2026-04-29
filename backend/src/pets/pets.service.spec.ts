import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './pets.service';
import { ConfigService } from '@nestjs/config';
import { PetsRepository } from './repositories/pets.repository';
import { S3Service } from '../integrations/s3/s3.service';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('PetsService', () => {
  let service: PetsService;
  let repository: PetsRepository;

  const mockRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    explain: jest.fn(),
    aggregate: jest.fn(),
    distinctBreeds: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'AWS_REGION') return 'us-east-1';
      if (key === 'AWS_S3_BUCKET') return 'test-bucket';
      return null;
    }),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: PetsRepository, useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
    repository = module.get<PetsRepository>(PetsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call repository.findAll and return metrics', async () => {
      const mockResults = [{ name: 'Rex', breed: 'Labrador' }];
      mockRepository.findAll.mockResolvedValue(mockResults);
      mockRepository.explain.mockResolvedValue({
        queryPlanner: { winningPlan: { stage: 'COLLSCAN' } },
        executionStats: { executionTimeMillis: 5, totalDocsExamined: 10 },
      });

      const filters = { name: 'Rex' };
      const response = await service.findAll(filters as any);

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(response).toHaveProperty('results');
      expect(response.metrics.executionTimeMillis).toBe(5);
    });
  });
});
