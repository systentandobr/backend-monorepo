import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SysProdutosController } from './sys-produtos.controller';
import { AffiliateProductController } from './affiliate-product.controller';
import { CategoryController } from './category.controller';
import { TaxCalculationController } from './controllers/tax-calculation.controller';
import { CatalogController } from './controllers/catalog.controller';
import { NavigationController } from './controllers/navigation.controller';
import { SysProdutosService } from './sys-produtos.service';
import { JwtValidatorService } from './services/jwt-validator.service';
import { PRODUCT_COLLECTION, ProductSchema } from './schemas/product.schema';
import { AFFILIATE_PRODUCT_COLLECTION, AffiliateProductSchema } from './schemas/affiliate-product.schema';
import { CATEGORY_COLLECTION, CategorySchema } from './schemas/category.schema';
import { CATALOG_COLLECTION, CatalogSchema } from './schemas/catalog.schema';
import {
  NAVIGATION_SESSION_COLLECTION,
  VISITED_PRODUCT_COLLECTION,
  SEARCH_HISTORY_COLLECTION,
  NavigationSessionSchema,
  VisitedProductSchema,
  SearchHistorySchema,
} from './schemas/navigation.schema';
import { AffiliateProductService } from './services/affiliate-product.service';
import { CategoryService } from './services/category.service';
import { CatalogService } from './services/catalog.service';
import { NavigationService } from './services/navigation.service';
import { TaxCalculationService, TributacaoICMS, TributacaoICMSCSt } from './services/tax-calculation.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sys_produtos'),
    MongooseModule.forFeature([
      { name: PRODUCT_COLLECTION, schema: ProductSchema },
      { name: AFFILIATE_PRODUCT_COLLECTION, schema: AffiliateProductSchema },
      { name: CATEGORY_COLLECTION, schema: CategorySchema },
      { name: CATALOG_COLLECTION, schema: CatalogSchema },
      { name: NAVIGATION_SESSION_COLLECTION, schema: NavigationSessionSchema },
      { name: VISITED_PRODUCT_COLLECTION, schema: VisitedProductSchema },
      { name: SEARCH_HISTORY_COLLECTION, schema: SearchHistorySchema },
    ]),
  ],
  controllers: [
    SysProdutosController,
    AffiliateProductController,
    CategoryController,
    TaxCalculationController,
    CatalogController,
    NavigationController,
  ],
  providers: [
    SysProdutosService,
    AffiliateProductService,
    CategoryService,
    CatalogService,
    NavigationService,
    JwtValidatorService,
    TaxCalculationService,
    TributacaoICMS,
    TributacaoICMSCSt,
  ],
  exports: [
    SysProdutosService,
    AffiliateProductService,
    CategoryService,
    CatalogService,
    NavigationService,
    TaxCalculationService,
  ],
})
export class SysProdutosModule {}
