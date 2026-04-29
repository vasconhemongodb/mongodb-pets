import { Test, TestingModule } from '@nestjs/testing';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { GetPetsFilterDto } from './dto/get-pets-filter.dto';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('PetsController', () => {
  let controller: PetsController;
  let service: PetsService;

  const mockPet = {
    _id: '1',
    name: 'Rex',
    breed: 'Labrador',
    birthDate: new Date('2020-01-01'),
    image: 'http://image.url',
  };

  const mockResponse = {
    results: [mockPet],
    total: 1,
    metrics: {
      query: {},
      executionTimeMillis: 10,
      indexesUsed: [],
      docsScanned: 1,
      docsReturned: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [
        {
          provide: PetsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockResponse),
            create: jest.fn().mockResolvedValue(mockPet),
            uploadImage: jest.fn().mockResolvedValue('http://image.url'),
          },
        },
      ],
    }).compile();

    controller = module.get<PetsController>(PetsController);
    service = module.get<PetsService>(PetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with filters', async () => {
      const filters: GetPetsFilterDto = { name: 'Rex', breed: 'Labrador' };
      const result = await controller.findAll(filters);
      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResponse);
    });
  });
});
