import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductionRun } from '../production/production-run.entity';
import { RawMaterial } from './raw-material.entity';
import { CreateRawMaterialDto, UpdateRawMaterialDto } from './raw-material.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(RawMaterial)
    private readonly rawMaterialRepo: Repository<RawMaterial>,
    private readonly dataSource: DataSource,
  ) {}

  create(dto: CreateRawMaterialDto) {
    const item = this.rawMaterialRepo.create(dto);
    return this.rawMaterialRepo.save(item);
  }

  findAll() {
    return this.rawMaterialRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.rawMaterialRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Raw material #${id} not found`);
    }
    return item;
  }

  async update(id: number, dto: UpdateRawMaterialDto) {
    if (dto.quantityAdjustment !== undefined && dto.quantityOnHand !== undefined) {
      throw new BadRequestException('Use either quantityAdjustment or quantityOnHand, not both');
    }

    if (dto.quantityAdjustment !== undefined) {
      return this.rawMaterialRepo.manager.transaction(async (manager) => {
        const repository = manager.getRepository(RawMaterial);
        const item = await repository.findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!item) {
          throw new NotFoundException(`Raw material #${id} not found`);
        }

        const adjustedQuantity = Number(item.quantityOnHand) + dto.quantityAdjustment;
        if (adjustedQuantity < 0) {
          throw new BadRequestException('Stock adjustment cannot reduce inventory below zero');
        }

        const { quantityAdjustment, ...updates } = dto;
        Object.assign(item, updates, { quantityOnHand: adjustedQuantity });
        return repository.save(item);
      });
    }

    return this.rawMaterialRepo.manager.transaction(async (manager) => {
      const repository = manager.getRepository(RawMaterial);
      const item = await repository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) {
        throw new NotFoundException(`Raw material #${id} not found`);
      }
      Object.assign(item, dto);
      return repository.save(item);
    });
  }

  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(RawMaterial);
      const item = await repository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) {
        throw new NotFoundException(`Raw material #${id} not found`);
      }

      const productionRunCount = await manager.getRepository(ProductionRun).countBy({
        rawMaterialId: id,
      });
      if (productionRunCount > 0) {
        throw new ConflictException('Cannot delete raw material while production runs reference it');
      }

      await repository.remove(item);
      return { deleted: true, id };
    });
  }
}
