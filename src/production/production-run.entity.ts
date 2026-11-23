import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RawMaterial } from '../inventory/raw-material.entity';

export enum ProductionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('production_runs')
export class ProductionRun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  batchCode: string;

  @Column()
  productName: string;

  @Column()
  rawMaterialId: number;

  @ManyToOne(() => RawMaterial, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rawMaterialId' })
  rawMaterial: RawMaterial;

  @Column('decimal', { precision: 12, scale: 2 })
  quantityUsed: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  quantityProduced: number;

  @Column({
    type: 'enum',
    enum: ProductionStatus,
    default: ProductionStatus.PLANNED,
  })
  status: ProductionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
