const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



async function disconnect() {
  await prisma.$disconnect();
}

module.exports = {
  disconnect,
};
