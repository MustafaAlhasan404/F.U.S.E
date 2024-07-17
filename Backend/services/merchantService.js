const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const controllerRole = "Merchant";

async function findAll() {
  return await prisma.users.findMany({
    where: { role: controllerRole, status: { not: "Deleted" } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birth: true,
      role: true,
      merchant: {
        select: {
          category: true,
          workPermit: true
        }
      }
    }
  });
}

async function findById(id) {
  const merchant = await prisma.users.findUnique({
    where: {
      id: parseInt(id),
      status: { not: "Deleted" },
      role: controllerRole
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birth: true,
      role: true,
      merchant: {
        select: {
          categoryId: true,
          workPermit: true
        }
      }
    }
  });

  if (!merchant) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Merchant account not found' };
    throw error;
  }

  return merchant;
}

async function updateById(id, data) {
  if (data.birth) data.birth = new Date(data.birth).toISOString();
  return await prisma.users.update({
    where: {
      id,
      role: controllerRole
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birth: true,
      role: true,
      merchant: {
        select: {
          category: true,
          workPermit: true
        }
      }
    }
  });
}

async function deleteMerchant(id) {
  return await prisma.users.update({
    where: {
      id,
      role: controllerRole,
    },
    data: {
      status: "Deleted"
    }
  });
}

async function create(userId, categoryName, workPermit) {
  const category = await prisma.merchantCategory.findFirst({
    where: {
      name: categoryName
    }
  });

  return await prisma.merchant.create({
    data: {
      userId,
      categoryId: category.id,
      workPermit
    }
  });
}


module.exports = {
  findAll,
  findById,
  updateById,
  deleteMerchant,
  create
};
