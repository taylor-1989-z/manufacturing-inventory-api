import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(page = 1, limit = 10, status?: string, search?: string) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));

    const qb = this.productsRepository.createQueryBuilder('product');

    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(product.name LIKE :search OR product.sku LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('product.id', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    const [items, total] = await qb.getManyAndCount();
    return {
      data: items,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(body: {
    sku: string;
    name: string;
    unitPrice?: number;
    status?: string;
  }): Promise<Product> {
    const existing = await this.productsRepository.findOne({
      where: { sku: body.sku },
    });
    if (existing) {
      throw new ConflictException(`SKU '${body.sku}' already exists`);
    }

    const product = this.productsRepository.create({
      sku: body.sku,
      name: body.name,
      unitPrice: body.unitPrice ?? 0,
      status: body.status ?? 'ACTIVE',
    });

    return this.productsRepository.save(product);
  }

  async update(
    id: number,
    body: Partial<{
      sku: string;
      name: string;
      unitPrice: number;
      status: string;
    }>,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (body.sku && body.sku !== product.sku) {
      const duplicate = await this.productsRepository.findOne({
        where: { sku: body.sku },
      });
      if (duplicate) {
        throw new ConflictException(`SKU '${body.sku}' already exists`);
      }
    }

    Object.assign(product, body);
    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
