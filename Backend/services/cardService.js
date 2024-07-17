const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAll() {
  return await prisma.cards.findMany({
    orderBy: [{ expiryDate: "desc" }],
    select: {
      id: true,
      accountNumber: true,
      expiryDate: true,
    }
  });
}

async function findById(id) {
  await prisma.cards.update({
    where: { id },
    data: {
      physical: true
    }
  });

  return await prisma.cards.findUnique({
    where: { id },
  });
}

async function findByAccountId(id) {
  return await prisma.cards.findMany({
    where: { accountNumber: id },
    orderBy: [{ expiryDate: "desc" }],
  });
}

async function findByUserId(id) {
  return await prisma.cards.findMany({
    where: {
      account: {
        userId: id
      }
    }
  });
}

async function create(cardName, accountNumber, PIN, balance) {
  let id, checkID;
  do {
    let randomNumber = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
    id = randomNumber.toString();

    checkID = await prisma.cards.findUnique({
      where: {id}
    });
  } while (checkID);

  let transaction = [];

  transaction.push(
    prisma.cards.create({
      data: {
        id,
        cardName,
        balance,
        accountNumber: accountNumber,
        cvv: Math.floor(Math.random() * 900) + 100,
        PIN
      }
    })
  )
  transaction.push(
    prisma.accounts.update({
      where: {
        id: accountNumber
      },
      data: {
        balance: { decrement: balance }
      }
    })
  )

  return await prisma.$transaction(transaction);
}

async function updateById(id, data) {
  if (data.expiryDate) data.expiryDate = new Date(data.expiryDate).toISOString();
  return await prisma.cards.update({
    where: { id },
    data
  });
}

async function updateBalance(id, amount, type) {
  const card = await prisma.cards.findUnique({
    where: { id },
  });

  let transaction = [];

  transaction.push(
    prisma.cards.update({
      where: { id },
      data: {
        balance: type === "Deposit"? { increment: amount } : { decrement: amount }
      }
    })
  )

  transaction.push(
    prisma.accounts.update({
      where: {
        id: card.accountNumber
      },
      data: {
        balance: type === "Deposit"? { decrement: amount } : { increment: amount }
      }
    })
  )

  return await prisma.$transaction(transaction);
}

async function deleteCard(id, userId) {
  const card = await prisma.cards.findUnique({
    where: { id },
  });

  if(!card) console.log("cant find card");

  let transaction = [];

  transaction.push(
    prisma.accounts.update({
      where: {
        id: card.accountNumber
      },
      data: {
        balance: { increment: card.balance }
      }
    })
  )
  
  transaction.push(
    prisma.cards.delete({
      where: { id , account: { user : { id: userId } } }
    })
  )


  return await prisma.$transaction(transaction);
}

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  deleteCard,
  findByAccountId,
  findByUserId,
  updateBalance
};
