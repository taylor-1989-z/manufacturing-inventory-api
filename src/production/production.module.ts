import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterial } from '../inventory/raw-material.entity';
import { ProductionController } from './production.controller';
import { ProductionOrdersController } from './production-orders.controller';
import { ProductionService } from './production.service';
import { ProductionRun } from './production-run.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionRun, RawMaterial])],
  controllers: [ProductionController, ProductionOrdersController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
