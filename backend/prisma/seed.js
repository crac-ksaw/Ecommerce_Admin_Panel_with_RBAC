"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminRole = await prisma.role.upsert({
        where: { name: "Admin" },
        update: {},
        create: { name: "Admin" },
    });
    const salesRole = await prisma.role.upsert({
        where: { name: "Sales" },
        update: {},
        create: { name: "Sales" },
    });
    const adminPassword = await bcryptjs_1.default.hash("Admin#123", 10);
    const salesPassword = await bcryptjs_1.default.hash("Sales#123", 10);
    await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {
            name: "Admin User",
            passwordHash: adminPassword,
            roleId: adminRole.id,
        },
        create: {
            email: "admin@example.com",
            name: "Admin User",
            passwordHash: adminPassword,
            roleId: adminRole.id,
        },
    });
    await prisma.user.upsert({
        where: { email: "sales@example.com" },
        update: {
            name: "Sales User",
            passwordHash: salesPassword,
            roleId: salesRole.id,
        },
        create: {
            email: "sales@example.com",
            name: "Sales User",
            passwordHash: salesPassword,
            roleId: salesRole.id,
        },
    });
    const existingProducts = await prisma.product.count();
    if (existingProducts === 0) {
        await prisma.product.createMany({
            data: [
                {
                    name: "Starter Hoodie",
                    description: "Soft fleece hoodie for everyday wear.",
                    price: 59.99,
                    sku: "HDY-001",
                    inventoryQuantity: 120,
                    status: client_1.ProductStatus.ACTIVE,
                },
                {
                    name: "Classic Tee",
                    description: "100% cotton crew neck tee.",
                    price: 24.5,
                    sku: "TEE-002",
                    inventoryQuantity: 300,
                    status: client_1.ProductStatus.ACTIVE,
                },
            ],
        });
    }
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
