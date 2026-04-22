import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

describe('LeadsService', () => {
  let service: LeadsService;

  const mockLead = {
    _id: '12345',
    name: 'Teste Silva',
    phone: '1199999999',
    channel: 'WHATSAPP',
    stage: 'NEW',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockLeadModel = {
    new: jest.fn().mockResolvedValue(mockLead),
    constructor: jest.fn().mockResolvedValue(mockLead),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(async () => {
    // Para mockar the new class instantiations:
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getModelToken('Lead'),
          useValue: mockLeadModel, // Usamos objeto simples porque mockar constructors do Mongoose é tricky
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a lead if found', async () => {
      mockLeadModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLead),
      });

      const result = await service.findById('12345');
      expect(result).toEqual(mockLead);
      expect(mockLeadModel.findOne).toHaveBeenCalledWith({ _id: '12345', deletedAt: null });
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockLeadModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a lead successfully', async () => {
      const updateData = { stage: 'QUALIFIED' as any };
      
      mockLeadModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockLead, ...updateData }),
      });

      const result = await service.update('12345', updateData);
      expect(result.stage).toBe('QUALIFIED');
    });
  });
});
