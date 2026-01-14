import { Test, TestingModule } from '@nestjs/testing';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

// Mock do AuthGuard
const mockAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 'test-user-id', email: 'test@example.com' };
    return true;
  },
};

describe('FinancialController', () => {
  let controller: FinancialController;
  let service: FinancialService;

  const mockFinancialService = {
    getPortfolio: jest.fn(),
    getPortfolioSummary: jest.fn(),
    getPortfolioRiskAnalysis: jest.fn(),
    getAssets: jest.fn(),
    getAsset: jest.fn(),
    getFinancialGoals: jest.fn(),
    getFinancialGoal: jest.fn(),
    createFinancialGoal: jest.fn(),
    updateFinancialGoal: jest.fn(),
    getFinancialAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialController],
      providers: [
        {
          provide: FinancialService,
          useValue: mockFinancialService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<FinancialController>(FinancialController);
    service = module.get<FinancialService>(FinancialService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /financial/portfolio', () => {
    it('should return portfolio data', async () => {
      const mockPortfolio = {
        totalValue: 10000,
        totalInvested: 9500,
        totalProfitLoss: 500,
        totalProfitLossPercentage: 5.26,
        assets: [],
        lastUpdated: new Date().toISOString(),
      };

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      mockFinancialService.getPortfolio.mockResolvedValue({
        success: true,
        data: mockPortfolio,
        timestamp: new Date().toISOString(),
      });

      const result = await controller.getPortfolio(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPortfolio);
      expect(service.getPortfolio).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('GET /financial/portfolio/risk-analysis', () => {
    it('should return risk analysis data', async () => {
      const mockRiskAnalysis = {
        totalRisk: 7.2,
        diversificationScore: 8.5,
        volatility: 12.3,
        sharpeRatio: 1.8,
        recommendations: ['Diversifique mais'],
      };

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      mockFinancialService.getPortfolioRiskAnalysis.mockResolvedValue({
        success: true,
        data: mockRiskAnalysis,
        timestamp: new Date().toISOString(),
      });

      const result = await controller.getPortfolioRiskAnalysis(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRiskAnalysis);
      expect(service.getPortfolioRiskAnalysis).toHaveBeenCalledWith(
        'test-user-id',
      );
    });
  });

  describe('GET /financial/goals', () => {
    it('should return financial goals', async () => {
      const mockGoals = [
        {
          id: '1',
          name: 'Reserva de Emergência',
          targetAmount: 10000,
          currentAmount: 5000,
          targetDate: '2024-12-31',
          priority: 'high',
        },
      ];

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      mockFinancialService.getFinancialGoals.mockResolvedValue({
        success: true,
        data: mockGoals,
        timestamp: new Date().toISOString(),
      });

      const result = await controller.getFinancialGoals(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGoals);
      expect(service.getFinancialGoals).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('POST /financial/goals', () => {
    it('should create a new financial goal', async () => {
      const goalData = {
        name: 'Casa Nova',
        targetAmount: 200000,
        targetDate: '2025-12-31',
        priority: 'medium' as 'low' | 'medium' | 'high',
      };

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      const mockCreatedGoal = {
        id: '2',
        ...goalData,
        currentAmount: 0,
        createdAt: new Date().toISOString(),
      };

      mockFinancialService.createFinancialGoal.mockResolvedValue({
        success: true,
        data: mockCreatedGoal,
        timestamp: new Date().toISOString(),
      });

      const result = await controller.createFinancialGoal(
        mockRequest,
        goalData,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedGoal);
      expect(service.createFinancialGoal).toHaveBeenCalledWith(
        'test-user-id',
        goalData,
      );
    });
  });
});
