import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { RawMaterial } from './inventory/raw-material.entity';
import { Role } from './auth/roles.enum';
import { User } from './users/user.entity';

async function seedDemoData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const config = app.get(ConfigService);
    const accounts = [
      { username: 'admin1', role: Role.ADMIN, passwordKey: 'DEMO_ADMIN_PASSWORD' },
      { username: 'inv_staff1', role: Role.INVENTORY_STAFF, passwordKey: 'DEMO_INVENTORY_PASSWORD' },
      { username: 'prod_staff1', role: Role.PRODUCTION_STAFF, passwordKey: 'DEMO_PRODUCTION_PASSWORD' },
    ];
    const missingPasswords = accounts
      .filter(({ passwordKey }) => !config.get<string>(passwordKey))
      .map(({ passwordKey }) => passwordKey);

    if (missingPasswords.length > 0) {
      throw new Error(`Set the following environment variables before seeding: ${missingPasswords.join(', ')}`);
    }

    const dataSource = app.get(DataSource);
    const users = dataSource.getRepository(User);
    for (const account of accounts) {
      const existing = await users.findOne({ where: { username: account.username } });
      if (existing) {
        if (existing.role !== account.role) {
          throw new Error(`User "${account.username}" already exists with a different role`);
        }
        console.log(`User "${account.username}" already exists; left unchanged.`);
        continue;
      }

      const user = users.create({
        username: account.username,
        role: account.role,
        password: await bcrypt.hash(config.get<string>(account.passwordKey), 10),
      });
      await users.save(user);
      console.log(`Created user "${account.username}".`);
    }

    const materials = dataSource.getRepository(RawMaterial);
    const sampleMaterials = [
      { sku: 'RM-001', name: 'Steel Sheets', unit: 'kg', quantityOnHand: 5, reorderLevel: 20 },
      { sku: 'RM-002', name: 'Aluminum Sheets', unit: 'kg', quantityOnHand: 120, reorderLevel: 25 },
      { sku: 'RM-003', name: 'Copper Wire', unit: 'm', quantityOnHand: 80, reorderLevel: 15 },
    ];

    for (const sample of sampleMaterials) {
      const existing = await materials.findOne({ where: { sku: sample.sku } });
      if (existing) {
        console.log(`Material "${sample.sku}" already exists; left unchanged.`);
        continue;
      }
      await materials.save(materials.create(sample));
      console.log(`Created sample material "${sample.sku}".`);
    }
  } finally {
    await app.close();
  }
}

seedDemoData().catch((error: unknown) => {
  console.error('Demo data seeding failed:', error);
  process.exitCode = 1;
});
