const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function findById(id) {
	return await prisma.bills.findUnique({
		where: {
			id: parseInt(id),
		},
		include: {
			merchantAccount: {
				select: {
					user: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});
}

async function findByMerchantId(id) {
  const merchantAccount = await prisma.accounts.findFirst({
    where: {
      user: {
        id
      },
      type: "Checking",
    }
  });

  return await prisma.bills.findMany({
    where: {
      merchantAccountNumber: merchantAccount.id,
      status: "Pending"
    },
  });
}

async function create(merchantAccount, amount, details, categoryId) {
	const category = await prisma.merchantCategory.findUnique({
		where: {
			id: parseInt(categoryId),
		},
	});

	return await prisma.bills.create({
		data: {
			merchantAccountNumber: merchantAccount,
			amount: amount,
			details: details ? details : "",
			category: category.name,
		},
	});
}

async function payBill(id, cardId, amount, merchantAccount) {
  const bill = await prisma.bills.findUnique({
    where: { id: parseInt(id) }
  });

  if (!bill) {
    throw new Error('Bill not found');
  }

  const transaction = await prisma.$transaction([
    prisma.bills.update({
      where: { id: bill.id },
      data: {
        status: "Paid",
        cardId,
        payedAt: new Date()
      }
    }),
    prisma.cards.update({
      where: {
        id: cardId
      },
      data: {
        balance: { decrement: amount }
      }
    }),
    prisma.accounts.update({
      where: {
        id: merchantAccount
      },
      data: {
        balance: { increment: amount }
      }
    })
  ]);

  if (!transaction) {
    throw new Error('Transaction failed');
  }

  return transaction;
}


module.exports = {
  create,
  findById,
  payBill,
  findByMerchantId
}