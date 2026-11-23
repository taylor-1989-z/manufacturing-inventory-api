import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProductionStatus } from './production-run.entity';

export class CreateProductionRunDto {
  @IsString()
  @IsNotEmpty()
  batchCode: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsInt()
  rawMaterialId: number;

  @IsNumber()
  @Min(0.01)
  quantityUsed: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityProduced?: number;

  @IsEnum(ProductionStatus)
  @IsOptional()
  status?: ProductionStatus;
}

export class UpdateProductionRunDto {
  @IsString()
  @IsOptional()
  productName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityProduced?: number;

  @IsEnum(ProductionStatus)
  @IsOptional()
  status?: ProductionStatus;
}
