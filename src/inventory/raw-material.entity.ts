import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('raw_materials')
export class RawMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column()
  unit: string; // hal. 'kg', 'pcs', 'liters'

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  quantityOnHand: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  reorderLevel: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
