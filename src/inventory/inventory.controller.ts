import {
  Body,
  Controller,
  Delete,
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
import { InventoryService } from './inventory.service';
import { CreateRawMaterialDto, UpdateRawMaterialDto } from './raw-material.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.INVENTORY_STAFF)
  create(@Body() dto: CreateRawMaterialDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.INVENTORY_STAFF, Role.PRODUCTION_STAFF)
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.INVENTORY_STAFF, Role.PRODUCTION_STAFF)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INVENTORY_STAFF)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRawMaterialDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
