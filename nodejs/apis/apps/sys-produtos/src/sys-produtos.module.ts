import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SysProdutosController } from './sys-produtos.controller';
import { AffiliateProductController } from './affiliate-product.controller';
import { CategoryController } from './category.controller';
import { SysProdutosService } from './sys-produtos.service';
import { JwtValidatorService } from './services/jwt-validator.service';
import { PRODUCT_COLLECTION, ProductSchema } from './schemas/product.schema';
import { AFFILIATE_PRODUCT_COLLECTION, AffiliateProductSchema } from './schemas/affiliate-product.schema';
import { CATEGORY_COLLECTION, CategorySchema } from './schemas/category.schema';
import { AffiliateProductService } from './services/affiliate-product.service';
import { CategoryService } from './services/category.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sys_produtos'),
    MongooseModule.forFeature([
      { name: PRODUCT_COLLECTION, schema: ProductSchema },
      { name: AFFILIATE_PRODUCT_COLLECTION, schema: AffiliateProductSchema },
      { name: CATEGORY_COLLECTION, schema: CategorySchema },
    ]),
  ],
  controllers: [SysProdutosController, AffiliateProductController, CategoryController],
  providers: [SysProdutosService, AffiliateProductService, CategoryService, JwtValidatorService],
  exports: [SysProdutosService, AffiliateProductService, CategoryService],
})
export class SysProdutosModule {}
