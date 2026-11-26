import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find({ order: { id: 'ASC' } });
  }

  async create(body: {
    name: string;
    contactEmail?: string;
    phone?: string;
    address?: string;
  }): Promise<Supplier> {
    const existing = await this.suppliersRepository.findOne({
      where: { name: body.name },
    });
    if (existing) {
      throw new ConflictException(`Supplier '${body.name}' already exists`);
    }

    const supplier = this.suppliersRepository.create(body);
    return this.suppliersRepository.save(supplier);
  }
}
