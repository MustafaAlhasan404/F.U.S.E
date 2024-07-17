const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAll() {
  return await prisma.users.findMany({
    where: {
      status: { not: "Deleted" }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birth: true,
      role: true
    }
  });
}

async function findById(id) {
  return await prisma.users.findUnique({
    where: {
      id,
      status: { not: "Deleted" }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birth: true,
      role: true,
      status: true
    }
  });
}

async function findCustomer(userId) {
  return await prisma.users.findFirst({
    where: {
      customer: {
        userId: parseInt(userId)
      }
    },
    include: {
      customer: true
    }
  });
}

async function updateUser(id,  data ) {
  if (data.birth) data.birth = (new Date(data.birth)).toISOString();
  return await prisma.users.update({
    where: {
      id
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birth: true,
      role: true
    }
  });
}

async function deleteUser(id) {
  return await prisma.users.update({
    where: {
      id
    },
    data: {
      status: "Deleted"
    }
  });
}

async function deleteUserFromDB(id) {
  await prisma.accounts.deleteMany({
    where: {
      userId : id
    }
  });

  return await prisma.users.delete({
    where: {
      id
    }
  });
}

async function create(name, role, email, phone, birth, password) {
  return await prisma.users.create({
    data: { name, role, email, phone, birth: (new Date(birth)).toISOString(), password },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birth: true,
      role: true
    }
  });
}

async function findByEmail(email) {
  return await prisma.users.findUnique({
    where: { email }
  });
}

async function findRecived(userId) {
  let recived = {};
  const userAccounts = await prisma.accounts.findMany({
    where: {
      userId
    },
    select: {
      id: true
    }
  });

  const accountIds = userAccounts.map(account => account.id); // Get an array of account ids

  const cash = await prisma.cashTransactions.findMany({
    where: {
      accountNumber: {
        in: accountIds
      },
      status: 'Completed'
    },
    select: {
      id: true,
      amount: true,
      accountNumber: true,
      createdAt: true,
    }
  });
  if(cash) {recived.cash = cash;}

  const user = prisma.merchant.findFirst({
    where: {
      userId
    }
  });
  if(user){
    const bills = await prisma.bills.findMany({
      where: {
        merchantAccount: {
          userId
        },
        status: 'Paid'
      },
      select: {
        id: true,
        amount: true,
        cardId: true,
        payedAt: true,
        card: {
          select: {
            account: {
              select: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        details: true
      }
    });
    if(bills){ recived.bills = bills };
  }

  const transfer = await prisma.transactions.findMany({
    where: {
      dAccount: {
        userId
      },
      status: 'Completed'
    },
    select: {
      id: true,
      amount: true,
      sAccount: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      createdAt: true
    }
  }); 
  if(transfer) {recived.transfer = transfer}

  return recived;
}

async function findSent(userId) {
  let sent = {};
  
  const userCards = await prisma.cards.findMany({
    where: {
      account: {
        userId
      }
    }
  });
  const cardIds = userCards.map(card => card.id);


    const bills = await prisma.bills.findMany({
      where: {
        cardId: {
          in : cardIds
        },
        status: 'Paid'
      },
      select: {
        id: true,
        amount: true,
        merchantAccount: {
          select: {
            user: {
              select: {
                name: true,
                merchant: {
                  select: {
                    Category: true
                  }
                }
              }
            }
          }
        },
        payedAt: true,
        details: true
      }
    });
    if(bills){ sent.bills = bills };


  const transfer = await prisma.transactions.findMany({
    where: {
      sAccount: {
        userId
      },
      status: 'Completed'
    },
    select: {
      id: true,
      amount: true,
      dAccount: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      createdAt: true
    }
  }); 
  if(transfer) {sent.transfer = transfer}

  return sent;
}

async function findExpenses(userId) {
  const userBills = await prisma.bills.findMany({
    where: {
      card: {
        account: {
          userId : parseInt(userId)
        }
      },
      status: "Paid"
    },
    select: {
      amount: true,
      category: true,
      payedAt: true
    }
  });

  const userTransfer = await prisma.transactions.findMany({
    where: {
      sAccount: {
        userId: parseInt(userId)
      },
      status: 'Completed'
    },
    select: {
      amount: true,
      createdAt: true
    }
  });

  const expenses = [];

  // Add expenses from userBills
  userBills.forEach(bill => {
    expenses.push({
      date: bill.payedAt,
      category: bill.category,
      amount: bill.amount
    });
  });

  // Add expenses from userTransfer
  userTransfer.forEach(transfer => {
    expenses.push({
      date: transfer.createdAt,
      category: 'Personal Spending',
      amount: transfer.amount
    });
  });

  return expenses;
}


module.exports = {
  findAll,
  findById,
  updateUser,
  deleteUser,
  create,
  findByEmail,
  deleteUserFromDB,
  findRecived,
  findSent,
  findExpenses,
  findCustomer
};
