# Manufacturing Inventory and Production Monitoring System API

RESTful backend API built with **NestJS**, **TypeORM**, and **MySQL** featuring JWT authentication and Role-Based Access Control (RBAC).

## Tech Stack
- NestJS, TypeScript
- TypeORM, MySQL
- JWT (@nestjs/jwt, Passport) & Role-Based Access Control
- class-validator & class-transformer

## API Testing & Development Tools
- **Postman:** Used for testing endpoints, JWT login (ccess_token), role access checks (401 / 403), and full CRUD workflows
- **VS Code & Git/GitHub:** Code editing, local database setup, and version control

## Roles & Permissions
- ADMIN: Full access across authentication, inventory, and production.
- INVENTORY_STAFF: Manage raw materials and restock inventory levels.
- PRODUCTION_STAFF: View inventory and manage production workflows.

## Setup & Run
1. Install dependencies: 
pm install
2. Configure .env from .env.example (MySQL credentials and JWT_SECRET).
3. Start dev server: 
pm run start:dev (http://localhost:3000).
