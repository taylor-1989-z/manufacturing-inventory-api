import { IsBoolean } from 'class-validator';

export class CorsSettingsDto {
  @IsBoolean()
  enabled: boolean;
}
