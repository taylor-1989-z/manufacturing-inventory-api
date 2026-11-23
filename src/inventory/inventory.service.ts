import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawMaterial } from './raw-material.entity';
import { CreateRawMaterialDto, UpdateRawMaterialDto } from './raw-material.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(RawMaterial)
    private readonly rawMaterialRepo: Repository<RawMaterial>,
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
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.rawMaterialRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.rawMaterialRepo.remove(item);
    return { deleted: true, id };
  }
}
