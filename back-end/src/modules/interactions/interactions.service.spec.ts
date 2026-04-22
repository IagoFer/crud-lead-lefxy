import { Test, TestingModule } from '@nestjs/testing';
import { InteractionsService } from './interactions.service';
import { LeadsService } from '../leads/leads.service';
import { FollowUpsService } from '../followups/followups.service';
import { getModelToken } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bullmq';

describe('InteractionsService', () => {
  let service: InteractionsService;

  const mockInteractionModel = {
    constructor: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockLeadModel = {
    findById: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockFollowUpModel = {
    constructor: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('dummy-key'),
  };

  const mockLeadsService = {
    findById: jest.fn(),
  };

  const mockFollowUpsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionsService,
        { provide: getModelToken('Interaction'), useValue: mockInteractionModel },
        { provide: getModelToken('Lead'), useValue: mockLeadModel },
        { provide: getModelToken('FollowUp'), useValue: mockFollowUpModel },
        { provide: getQueueToken('followups'), useValue: mockQueue },
        { provide: 'ConfigService', useValue: mockConfigService },
        { provide: LeadsService, useValue: mockLeadsService },
        { provide: FollowUpsService, useValue: mockFollowUpsService },
      ],
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
