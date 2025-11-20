import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SysProdutosController } from './sys-produtos.controller';
import { SysProdutosService } from './sys-produtos.service';
import { JwtValidatorService } from './services/jwt-validator.service';
import { PRODUCT_COLLECTION, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sys_produtos'),
    MongooseModule.forFeature([
      { name: PRODUCT_COLLECTION, schema: ProductSchema },
    ]),
  ],
  controllers: [SysProdutosController],
  providers: [SysProdutosService, JwtValidatorService],
})
export class SysProdutosModule {}
