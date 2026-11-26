import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ default: 'kg' })
  unit: string;

  @Column({ type: 'int', default: 0 })
  reorderLevel: number;

  @CreateDateColumn()
  createdAt: Date;
}
