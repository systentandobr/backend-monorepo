import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { UsersService } from './users.service';

@Module({
  imports: [HttpModule],
  controllers: [UsersController, RolesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
