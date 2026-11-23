import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';
import { CreateProductionRunDto, UpdateProductionRunDto } from './production-run.dto';
import { ProductionService } from './production.service';

@Controller('production')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRODUCTION_STAFF)
  create(@Body() dto: CreateProductionRunDto) {
    return this.productionService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PRODUCTION_STAFF, Role.INVENTORY_STAFF)
  findAll() {
    return this.productionService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PRODUCTION_STAFF, Role.INVENTORY_STAFF)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRODUCTION_STAFF)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductionRunDto) {
    return this.productionService.update(id, dto);
  }
}
