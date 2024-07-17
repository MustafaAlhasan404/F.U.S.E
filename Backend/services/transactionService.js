const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const accountService = require('../services/accountService');

async function findAll() {
  return await prisma.transactions.findMany({
    include: {
      sAccount: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      dAccount: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
    }
  });
}

async function findById(id) {
  return await prisma.transactions.findUnique({ where: { id } });
}

async function findAllTopUp() {
  return await prisma.transactions.findMany({
    where: {
      sAccount: {
        user: {
          OR: [
            { role: 'Admin' },
            { role: 'Employee' }
          ]
        }
      },
      type: 'Deposit'
    },
    select: {
      id: true,
      sAccount: {
        select: {
          user: {
            select: {
              role: true
            }
          }
        }
      },
      dAccount: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      destinationAccount: true,
      amount: true,
      status: true,
    }
  })
}

async function findAllFromTo(sourceRole, destinationRole) {
  sourceRole = sourceRole.charAt(0).toUpperCase() + sourceRole.slice(1);
  destinationRole = destinationRole.charAt(0).toUpperCase() + destinationRole.slice(1);

  return await prisma.transactions.findMany({
    where: {
      sAccount: {
        user: {
          role: sourceRole
        }
      },
      dAccount: {
        user: {
          role: destinationRole
        }
      }
    },
    include: {
      sAccount: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      dAccount: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },

    }
  });
}

async function create(type, sourceAccount, destinationAccount, amount) {
  return await prisma.transactions.create({
    data: { type, sourceAccount, destinationAccount, amount }
  });
}

async function updateById(id, data) {
  return await prisma.transactions.update({ where: { id }, data });
}

async function makeTransfer(id, sourceAccount, destinationAccount, amount) {
  const transactions = [
    prisma.accounts.update({
      where: { id: sourceAccount.id },
      data: { balance: { decrement: amount } }
    }),
    prisma.accounts.update({
      where: { id: destinationAccount.id },
      data: { balance: { increment: amount } }
    }),
    prisma.transactions.update({
      where: { id },
      data: { status: "Completed" }
    })
  ];

  return await prisma.$transaction(transactions);
}

async function deposit(id, sourceAccount, destinationAccount, amount) {
  const transactions = sourceAccount.user.role === "Vendor" ? [
    prisma.accounts.update({
      where: { id: sourceAccount.id },
      data: { balance: { decrement: amount } }
    }),
    prisma.accounts.update({
      where: { id: destinationAccount.id },
      data: { balance: { increment: amount } }
    }),
    prisma.transactions.update({
      where: { id },
      data: { status: "Completed" }
    })
  ] : [
    prisma.accounts.update({
      where: { id: destinationAccount.id },
      data: { balance: { increment: amount } }
    }),
    prisma.transactions.update({
      where: { id },
      data: { status: "Completed" }
    })
  ];

  return await prisma.$transaction(transactions);
}

async function withdraw(id, sourceAccount, destinationAccount, amount) {
  const transactions = destinationAccount.user.role === "Vendor" ? [
    prisma.accounts.update({
      where: { id: sourceAccount.id },
      data: { balance: { decrement: amount } }
    }),
    prisma.accounts.update({
      where: { id: destinationAccount.id },
      data: { balance: { increment: amount } }
    }),
    prisma.transactions.update({
      where: { id },
      data: { status: "Completed" }
    })
  ] : [
    prisma.accounts.update({
      where: { id: sourceAccount.id },
      data: { balance: { decrement: amount } }
    }),
    prisma.transactions.update({
      where: { id },
      data: { status: "Completed" }
    })
  ];

  return await prisma.$transaction(transactions);
}

async function makeTransaction(transactions) {
  return await prisma.$transaction(transactions);
}

async function addTransactionDetails(id, details) {
  return await prisma.transactionsDetails.create({
    data: {
      transactionId: id,
      details
    }
  })
}

async function changeSourceAccount(id, oldAccount, newAcconnt, amount, newAmount) {
  const transactions = [];
  const transaction = await prisma.transactions.findUnique({ where: { id } });

  if (transaction.status === "Completed") {
    transactions.push(
      prisma.accounts.update({
        where: { id: oldAccount.id },
        data: { balance: { increment: parseFloat(amount) } }
      })
    );

    transactions.push(
      prisma.accounts.update({
        where: { id: newAcconnt.id },
        data: { balance: { decrement: parseFloat(newAmount ?? amount) } }
      })
    );

    if (newAmount != amount) {
      transactions.push(
        prisma.accounts.update({
          where: { id: transaction.destinationAccount },
          data: { balance: { increment: parseFloat(newAmount - amount) } }
        })
      );
    }
  }

  transactions.push(
    prisma.transactions.update({
      where: { id },
      data: { sourceAccount: newAcconnt.id, amount: newAmount ?? amount }
    })
  );

  return await prisma.$transaction(transactions);
}

async function changeDestinationAccount(id, oldAccount, newAcconnt, amount, newAmount) {
  const transactions = [];
  const transaction = await prisma.transactions.findUnique({ where: { id } });

  if (transaction.status === "Completed") {
    transactions.push(
      prisma.accounts.update({
        where: { id: oldAccount.id },
        data: { balance: { decrement: parseFloat(amount) } }
      })
    );

    transactions.push(
      prisma.accounts.update({
        where: { id: newAcconnt.id },
        data: { balance: { increment: parseFloat(newAmount) } }
      })
    );

    if (newAmount != amount) {
      transactions.push(
        prisma.accounts.update({
          where: { id: transaction.sourceAccount },
          data: { balance: { decrement: parseFloat(newAmount - amount) } }
        })
      );
    }
  }

  transactions.push(
    prisma.transactions.update({
      where: { id },
      data: { destinationAccount: newAcconnt.id, amount: newAmount ?? amount }
    })
  );

  return await prisma.$transaction(transactions);
}

async function changeAmount(id, newAmount, oldAmount) {
  const transactions = [];
  const transaction = await prisma.transactions.findUnique({ where: { id } });
  const diff = newAmount - oldAmount;
  const sourceAccount = await accountService.findById(transaction.sourceAccount);

  if (transaction.status === "Completed") {
    transactions.push(
      prisma.accounts.update({
        where: { id: transaction.sourceAccount },
        data: { balance: { decrement: parseFloat(diff) } }
      })
    );

    transactions.push(
      prisma.accounts.update({
        where: { id: transaction.destinationAccount },
        data: { balance: { increment: parseFloat(diff) } }
      })
    );
  }

  transactions.push(
    prisma.transactions.update({
      where: { id },
      data: { amount: newAmount }
    })
  );

  return await prisma.$transaction(transactions);
}

async function deleteById(id) {
  const transaction = await prisma.transactions.findUnique({ where: { id } });
  const transactions = [
    prisma.accounts.update({
      where: { id: transaction.sourceAccount },
      data: { balance: { increment: parseFloat(transaction.amount) } }
    }),
    prisma.accounts.update({
      where: { id: transaction.destinationAccount },
      data: { balance: { decrement: parseFloat(transaction.amount) } }
    }),
    prisma.transactions.update({
      where: { id },
      data: { status: "Deleted" }
    })
  ];

  return await prisma.$transaction(transactions);
}

async function patchDeposit(id, amount, newAcconnt) {

}

async function patchWithdraw(id, amount, newAcconnt) {

}


module.exports = {
  findAll,
  findById,
  create,
  updateById,
  makeTransaction,
  makeTransfer,
  deposit,
  withdraw,
  addTransactionDetails,
  findAllFromTo,
  findAllTopUp,
  changeSourceAccount,
  changeDestinationAccount,
  changeAmount,
  deleteById,
  patchDeposit,
  patchWithdraw
};
