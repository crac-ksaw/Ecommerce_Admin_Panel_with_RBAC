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
- `deleted_at` (nullable, used for soft delete)
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
- Product deletion uses soft delete (`deleted_at`).
- Timestamps are stored in `created_at` and `updated_at`.

## Environment Variables
Backend env (`backend/.env`):
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`

Frontend env (`frontend/.env`):
- `VITE_API_BASE`


## Setup
1. One-time setup (single command)

```bash
npm run setup
```

This command does all of the following:
- Installs root, backend, and frontend dependencies
- Creates `backend/.env` and `frontend/.env` from examples (if missing)
- Runs Prisma migrations
- Runs seed data
- Stops on first failure with a clear step-specific error message
- Cleans up `.env` files created by that failed setup run

2. Edit env files if needed

```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

To check the database using prisma interface:
```bash
cd backend
npx prisma studio
```

3. Start project from the root directory:

```bash
npm run dev
```

Runs:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Soft Deletion
- Product deletion is implemented as soft delete using `deleted_at`.
- Soft-deleted products are excluded from product listing.
- Restore can be done manually by setting `deleted_at = NULL` in the database.

## API Summary
- `POST /api/auth/login`
- `GET /api/products` (Admin, Sales)
- `POST /api/products` (Admin only)
- `PUT /api/products/:id`
  - Admin: full update
  - Sales: `name`, `description`, `price` only
- `DELETE /api/products/:id` (Admin only, soft delete)

## Auth / RBAC Approach
- Passwords are hashed with bcrypt.
- Login returns a JWT.
- Protected routes require `Bearer` token.
- Role and field-level checks are validated server-side in middleware/controller flow.
