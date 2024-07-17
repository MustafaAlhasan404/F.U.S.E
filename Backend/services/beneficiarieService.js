const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAll() {
  return await prisma.beneficiaries.findMany();
}

async function findByUserId(id) {
  return await prisma.beneficiaries.findMany({
    where: {
      OR: [
        { requstUser: id },
        { acceptUser: id, accepted: true },
      ],
    },
  });
}

async function find(requstUser, acceptUser) {
  return await prisma.beneficiaries.findFirst({
    where: {
      OR: [
        {
          requstUser: parseInt(requstUser),
          acceptUser: parseInt(acceptUser),
        },
        {
          requstUser: parseInt(acceptUser),
          acceptUser: parseInt(requstUser),
        },
      ],
    },
  });
}

async function create(requstUser, acceptUser) {
  return await prisma.beneficiaries.create({
    data: {
      requstUser: parseInt(requstUser),
      acceptUser: parseInt(acceptUser),
    },
  });
}

async function updateById(id, requstUser) {
  return await prisma.beneficiaries.update({
    where: {
      id: id,
      acceptUser: requstUser,
    },
    data: {
      accepted: true,
    },
  });
}

async function findById(id) {
  return await prisma.beneficiaries.findUnique({
    where: {
      id: parseInt(id),
    },
  });
}

async function updateById(id,  data ) {
  return await prisma.beneficiaries.update({
    where: {
      id: parseInt(id),
    },
    data
  });
}

async function deleteById(id) {
  return await prisma.beneficiaries.delete({
    where: {
      id: parseInt(id),
    },
  });
}

module.exports = {
  findAll,
  findByUserId,
  find,
  create,
  updateById,
  findById,
  updateById,
  deleteById
};
