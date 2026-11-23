import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RawMaterial } from '../inventory/raw-material.entity';
import { CreateProductionRunDto, UpdateProductionRunDto } from './production-run.dto';
import { ProductionRun, ProductionStatus } from './production-run.entity';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionRun)
    private readonly productionRepo: Repository<ProductionRun>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductionRunDto) {
    return this.dataSource.transaction(async (manager) => {
      const material = await manager.findOne(RawMaterial, {
        where: { id: dto.rawMaterialId },
      });
      if (!material) {
        throw new NotFoundException(`Raw material #${dto.rawMaterialId} not found`);
      }

      const currentStock = Number(material.quantityOnHand);
      const usedQty = Number(dto.quantityUsed);
      if (currentStock < usedQty) {
        throw new BadRequestException(
          `Insufficient stock for ${material.name} (${material.sku}). Available: ${currentStock}, Required: ${usedQty}`,
        );
      }

      material.quantityOnHand = Number((currentStock - usedQty).toFixed(2));
      await manager.save(RawMaterial, material);

      const run = manager.create(ProductionRun, {
        ...dto,
        status: dto.status ?? ProductionStatus.IN_PROGRESS,
      });
      return manager.save(ProductionRun, run);
    });
  }

  findAll() {
    return this.productionRepo.find({
      relations: ['rawMaterial'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const run = await this.productionRepo.findOne({
      where: { id },
      relations: ['rawMaterial'],
    });
    if (!run) {
      throw new NotFoundException(`Production run #${id} not found`);
    }
    return run;
  }

  async update(id: number, dto: UpdateProductionRunDto) {
    const run = await this.findOne(id);
    Object.assign(run, dto);
    return this.productionRepo.save(run);
  }
}
