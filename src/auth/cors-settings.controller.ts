import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CorsSettingsDto } from './dto/cors-settings.dto';
import { CorsSettingsService } from './cors-settings.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Role } from './roles.enum';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('settings/cors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CorsSettingsController {
  constructor(private readonly corsSettings: CorsSettingsService) {}

  @Get()
  getSettings() {
    return { enabled: this.corsSettings.enabled };
  }

  @Patch()
  updateSettings(@Body() settings: CorsSettingsDto) {
    this.corsSettings.enabled = settings.enabled;
    return { enabled: this.corsSettings.enabled };
  }
}
