import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SysProdutosController } from './sys-produtos.controller';
import { AffiliateProductController } from './affiliate-product.controller';
import { CategoryController } from './category.controller';
import { TaxCalculationController } from './controllers/tax-calculation.controller';
import { CatalogController } from './controllers/catalog.controller';
import { NavigationController } from './controllers/navigation.controller';
import { InventoryController } from './controllers/inventory.controller';
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
import { InventoryService } from './services/inventory.service';
import { CatalogProductController } from './controllers/catalog-product.controller';
import { ProductImageController } from './controllers/product-image.controller';
import { CatalogProductService } from './services/catalog-product.service';
import { ProductImageService } from './services/product-image.service';
import { PRODUCT_IMAGE_COLLECTION, ProductImageSchema } from './schemas/product-image.schema';
import { IngredientsController } from './controllers/ingredients.controller';
import { IngredientsService } from './services/ingredients.service';
import { Ingredient, IngredientSchema } from './schemas/ingredient.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sys_produtos'),
    MongooseModule.forFeature([
      { name: PRODUCT_COLLECTION, schema: ProductSchema },
      { name: AFFILIATE_PRODUCT_COLLECTION, schema: AffiliateProductSchema },
      { name: CATEGORY_COLLECTION, schema: CategorySchema },
      { name: CATALOG_COLLECTION, schema: CatalogSchema },
      { name: NAVIGATION_SESSION_COLLECTION, schema: NavigationSessionSchema },
      { name: VISITED_PRODUCT_COLLECTION, schema: VisitedProductSchema },
      { name: SEARCH_HISTORY_COLLECTION, schema: SearchHistorySchema },
      { name: PRODUCT_IMAGE_COLLECTION, schema: ProductImageSchema },
      { name: Ingredient.name, schema: IngredientSchema },
    ]),
  ],
  controllers: [
    SysProdutosController,
    AffiliateProductController,
    CategoryController,
    TaxCalculationController,
    CatalogController,
    NavigationController,
    InventoryController,
    CatalogProductController,
    ProductImageController,
    IngredientsController,
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
    InventoryService,
    CatalogProductService,
    ProductImageService,
    IngredientsService,
  ],
  exports: [
    SysProdutosService,
    AffiliateProductService,
    CategoryService,
    CatalogService,
    NavigationService,
    TaxCalculationService,
    InventoryService,
    CatalogProductService,
    ProductImageService,
    IngredientsService,
  ],
})
export class SysProdutosModule {}
