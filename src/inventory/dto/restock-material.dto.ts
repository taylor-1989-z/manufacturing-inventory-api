import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RestockMaterialDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantityToAdd: number;
}
