const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function create(userId, monthlyIncome) {
  return await prisma.customer.create({
    data: { userId, monthlyIncome }
  });
}

module.exports = {
  create
}