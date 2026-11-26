import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialsRepository: Repository<Material>,
  ) {}

  async findAll(): Promise<Material[]> {
    return this.materialsRepository.find({ order: { id: 'ASC' } });
  }

  async create(body: {
    code: string;
    name: string;
    unit?: string;
    reorderLevel?: number;
  }): Promise<Material> {
    const existing = await this.materialsRepository.findOne({
      where: { code: body.code },
    });
    if (existing) {
      throw new ConflictException(`Material code '${body.code}' already exists`);
    }

    const material = this.materialsRepository.create({
      code: body.code,
      name: body.name,
      unit: body.unit ?? 'kg',
      reorderLevel: body.reorderLevel ?? 0,
    });

    return this.materialsRepository.save(material);
  }

  async update(
    id: number,
    body: Partial<{
      code: string;
      name: string;
      unit: string;
      reorderLevel: number;
    }>,
  ): Promise<Material> {
    const material = await this.materialsRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException(`Material #${id} not found`);
    }

    if (body.code && body.code !== material.code) {
      const duplicate = await this.materialsRepository.findOne({
        where: { code: body.code },
      });
      if (duplicate) {
        throw new ConflictException(`Material code '${body.code}' already exists`);
      }
    }

    Object.assign(material, body);
    return this.materialsRepository.save(material);
  }
}
