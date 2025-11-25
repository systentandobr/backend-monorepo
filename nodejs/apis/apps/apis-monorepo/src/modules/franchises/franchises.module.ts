import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FranchisesService } from './franchises.service';
import { FranchisesController } from './franchises.controller';
import { Franchise, FranchiseSchema } from './schemas/franchise.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/franchises'),
    MongooseModule.forFeature([
      { name: Franchise.name, schema: FranchiseSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [FranchisesController],
  providers: [FranchisesService],
  exports: [FranchisesService],
})
export class FranchisesModule {}

