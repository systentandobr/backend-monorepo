import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NAVIGATION_SESSION_COLLECTION,
  VISITED_PRODUCT_COLLECTION,
  SEARCH_HISTORY_COLLECTION,
  NavigationSession,
  VisitedProduct,
  SearchHistory,
  VisitSource,
  ProductInteractions,
  SearchFilters,
  SearchResult,
} from '../schemas/navigation.schema';

@Injectable()
export class NavigationService {
  constructor(
    @InjectModel(NAVIGATION_SESSION_COLLECTION)
    private readonly navigationSessionModel: Model<NavigationSession>,
    @InjectModel(VISITED_PRODUCT_COLLECTION)
    private readonly visitedProductModel: Model<VisitedProduct>,
    @InjectModel(SEARCH_HISTORY_COLLECTION)
    private readonly searchHistoryModel: Model<SearchHistory>,
  ) {}

  // Navigation Session
  async createSession(
    unitId: string | undefined,
    userId: string,
    sessionId: string,
    deviceInfo: { userAgent: string; ip: string; deviceType: string },
  ): Promise<NavigationSession> {
    const session = await this.navigationSessionModel.create({
      unitId,
      userId,
      sessionId,
      startedAt: new Date(),
      lastActivity: new Date(),
      deviceInfo,
      status: 'active',
    });
    return session.toObject();
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.navigationSessionModel.updateOne(
      { sessionId },
      { lastActivity: new Date() },
    );
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.navigationSessionModel.updateOne({ sessionId }, { status: 'closed' });
  }

  // Visited Products
  async trackProductVisit(
    unitId: string | undefined,
    userId: string,
    productId: string,
    source: VisitSource,
    interactions?: Partial<ProductInteractions>,
    metadata?: { referrer?: string; searchTerm?: string; category?: string },
    duration?: number,
  ): Promise<VisitedProduct> {
    const visitedProduct = await this.visitedProductModel.create({
      unitId,
      userId,
      productId,
      visitedAt: new Date(),
      duration: duration || 0,
      source,
      interactions: {
        viewedImages: false,
        readDescription: false,
        checkedReviews: false,
        addedToCart: false,
        addedToWishlist: false,
        ...interactions,
      },
      metadata: {
        referrer: metadata?.referrer || '',
        searchTerm: metadata?.searchTerm || '',
        category: metadata?.category || '',
      },
    });
    return visitedProduct.toObject();
  }

  async getVisitedProducts(
    unitId: string | undefined,
    userId: string,
    limit: number = 10,
  ): Promise<VisitedProduct[]> {
    const filter: any = { userId };
    if (unitId) filter.unitId = unitId;

    const visitedProducts = await this.visitedProductModel
      .find(filter)
      .sort({ visitedAt: -1 })
      .limit(limit)
      .lean();
    return visitedProducts as VisitedProduct[];
  }

  // Search History
  async saveSearch(
    unitId: string | undefined,
    userId: string,
    sessionId: string,
    query: string,
    resultsCount: number,
    filters?: SearchFilters,
    results?: SearchResult[],
    metadata?: { searchType?: 'text' | 'filter' | 'autocomplete' | 'voice'; autocomplete?: boolean },
  ): Promise<SearchHistory> {
    const searchHistory = await this.searchHistoryModel.create({
      unitId,
      userId,
      sessionId,
      query,
      searchedAt: new Date(),
      resultsCount,
      filters: filters || {},
      results: results || [],
      metadata: {
        searchType: metadata?.searchType || 'text',
        autocomplete: metadata?.autocomplete || false,
      },
    });
    return searchHistory.toObject();
  }

  async getSearchHistory(
    unitId: string | undefined,
    userId: string,
    limit: number = 10,
  ): Promise<SearchHistory[]> {
    const filter: any = { userId };
    if (unitId) filter.unitId = unitId;

    const history = await this.searchHistoryModel
      .find(filter)
      .sort({ searchedAt: -1 })
      .limit(limit)
      .lean();
    return history as SearchHistory[];
  }
}


