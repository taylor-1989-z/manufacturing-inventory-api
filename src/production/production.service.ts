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
        lock: { mode: 'pessimistic_write' },
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
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ProductionRun);
      const run = await repository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!run) {
        throw new NotFoundException(`Production run #${id} not found`);
      }

      Object.assign(run, dto);
      return repository.save(run);
    });
  }

  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const runRepository = manager.getRepository(ProductionRun);
      const run = await runRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!run) {
        throw new NotFoundException(`Production run #${id} not found`);
      }

      const materialRepository = manager.getRepository(RawMaterial);
      const material = await materialRepository.findOne({
        where: { id: run.rawMaterialId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!material) {
        throw new NotFoundException(`Raw material #${run.rawMaterialId} not found`);
      }

      material.quantityOnHand = Number(
        (Number(material.quantityOnHand) + Number(run.quantityUsed)).toFixed(2),
      );
      await materialRepository.save(material);
      await runRepository.remove(run);

      return { deleted: true, id };
    });
  }
}
