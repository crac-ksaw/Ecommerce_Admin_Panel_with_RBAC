# E-commerce Admin Panel (RBAC)

Full-stack assignment project using:
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Frontend: React + Vite
- Auth: JWT + bcrypt

## Roles
- `Admin`
- `Sales`

Seeded users:
- Admin: `admin@example.com` / `Admin#123`
- Sales: `sales@example.com` / `Sales#123`

## Authorization Rules
- Admin:
  - Full product access (Create, Read, Update, Delete)
- Sales:
  - Can view products
  - Can update only `name`, `description`, and `price`
  - Cannot create or delete
  - Cannot update `sku`, `inventory_quantity`, or `status`

All restrictions are enforced on the backend.

## Product Fields
- `id`
- `name`
- `description`
- `price`
- `sku` (unique)
- `inventory_quantity`
- `status` (`active` / `inactive`)
- `created_at`
- `updated_at`

## Database Design
Tables:
- `roles`
- `users`
- `products`

Schema choices:
- `users.role_id` references `roles.id` (normalized role model).
- `users.email` is unique.
- `products.sku` is unique.
- Timestamps are stored in `created_at` and `updated_at`.

## Environment Variables
Use one root `.env` file:

```bash
copy .env.example .env
```

Required variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `VITE_API_BASE`

## Setup
1. Install dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

2. Run migrations and seed

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

3. Start project (single command from root)

```bash
npm run dev
```

Runs:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## API Summary
- `POST /api/auth/login`
- `GET /api/products` (Admin, Sales)
- `POST /api/products` (Admin only)
- `PUT /api/products/:id`
  - Admin: full update
  - Sales: `name`, `description`, `price` only
- `DELETE /api/products/:id` (Admin only)

## Auth / RBAC Approach
- Passwords are hashed with bcrypt.
- Login returns a JWT.
- Protected routes require `Bearer` token.
- Role and field-level checks are validated server-side in middleware/controller flow.
