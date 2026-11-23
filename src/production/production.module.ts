import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionController } from './production.controller';
import { ProductionRun } from './production-run.entity';
import { ProductionService } from './production.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionRun])],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
