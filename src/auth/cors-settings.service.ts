import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsSettingsService {
  enabled: boolean;

  constructor(config: ConfigService) {
    this.enabled = config.get<string>('CORS_ENABLED', 'true') !== 'false';
  }
}
