const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const categories = [
  'Rent/Mortgage',
  'Healthcare',
  'Insurance',
  'Utilities',
  'Food/Groceries',
  'Childcare',
  'Transportation',
  'Personal Spending',
  'Home Goods',
  'Clothing',
  'Pets',
  'Restaurants',
  'Travel & Entertainment',
  'Electronics',
  'Beauty Products',
  'Services',
  'Subscriptions',
];

async function main() {
  await deleteAllData();

  for (const category of categories) {
    await prisma.merchantCategory.create({
      data: {
        name: category,
      },
    });
  }

  const admin = await createUser('Admin', 'The Admin', 'admin@mail.com', '1234560000', '1990-01-01', 'admin12345');
  const [adminAccount, adminCard] = await createAccountsAndCards(admin.id, 2);
  // Create merchant users
  const merchant1 = await createUser('Merchant', 'John Doe', 'john@example.com', '1234567890', '1990-01-01', 'password123');
  const merchant2 = await createUser('Merchant', 'Jane Smith', 'jane@example.com', '0987654321', '1985-05-15', 'password456');
  const merchant3 = await createUser('Merchant', 'Bob Johnson', 'bob@example.com', '5551234567', '1980-12-25', 'password789');

  // Create vendor users
  const vendor1 = await createUser('Vendor', 'Alice Williams', 'alice@example.com', '9876543210', '1995-07-10', 'password012');
  const vendor2 = await createUser('Vendor', 'Michael Brown', 'michael@example.com', '1112223333', '1992-03-20', 'password345');
  const vendor3 = await createUser('Vendor', 'Emily Davis', 'emily@example.com', '4445556666', '1988-09-15', 'password678');

  // Create customer users
  const customer1 = await createUser('Customer', 'David Wilson', 'david@example.com', '7778889999', '1998-11-25', 'password901');
  const customer2 = await createUser('Customer', 'Sophia Thompson', 'sophia@example.com', '2223334444', '1985-06-10', 'password234');
  const customer3 = await createUser('Customer', 'Daniel Anderson', 'daniel@example.com', '5556667777', '1992-02-28', 'password567');

  // Create accounts and cards for each user
  const [merchant1Accounts, merchant1Cards] = await createAccountsAndCards(merchant1.id, 2);
  const [merchant2Accounts, merchant2Cards] = await createAccountsAndCards(merchant2.id, 2);
  const [merchant3Accounts, merchant3Cards] = await createAccountsAndCards(merchant3.id, 2);

  const [vendor1Accounts, vendor1Cards] = await createAccountsAndCards(vendor1.id, 2);
  const [vendor2Accounts, vendor2Cards] = await createAccountsAndCards(vendor2.id, 2);
  const [vendor3Accounts, vendor3Cards] = await createAccountsAndCards(vendor3.id, 2);

  const [customer1Accounts, customer1Cards] = await createAccountsAndCards(customer1.id, 2);
  const [customer2Accounts, customer2Cards] = await createAccountsAndCards(customer2.id, 2);
  const [customer3Accounts, customer3Cards] = await createAccountsAndCards(customer3.id, 2);

  // Create transactions
  await createTransactions(merchant1Accounts, merchant2Accounts, 5);
  await createTransactions(merchant2Accounts, merchant3Accounts, 5);
  await createTransactions(vendor1Accounts, customer1Accounts, 5);
  await createTransactions(vendor2Accounts, customer2Accounts, 5);
  await createTransactions(vendor3Accounts, customer3Accounts, 5);
  await createTransactions(customer1Accounts, customer2Accounts, 5);
  await createTransactions(customer2Accounts, customer3Accounts, 5);
  await createTransactions(customer3Accounts, merchant1Accounts, 5);

  console.log('Data populated successfully!');
}

async function deleteAllData() {
  const deleteTables = prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE "Transactions" RESTART IDENTITY CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Cards" RESTART IDENTITY CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Accounts" RESTART IDENTITY CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Beneficiaries" RESTART IDENTITY CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Merchant" RESTART IDENTITY CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Customer" RESTART IDENTITY CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE`,
  ]);

  await deleteTables;
}

async function createUser(role, name, email, phone, birth, password) {
  const user = await prisma.users.create({
    data: {
      role,
      name,
      email,
      phone,
      birth: new Date(birth),
      password: await bcrypt.hash(password, 10),
    },
  });

  if (role === 'Merchant') {
    await prisma.merchant.create({
      data: {
        userId: user.id,
        categoryId: 1,
        workPermit: 'ABC123',
      },
    });
  } else if (role === 'Customer') {
    await prisma.customer.create({
      data: {
        userId: user.id,
        monthlyIncome: 50000,
      },
    });
  }

  return user;
}

async function createAccountsAndCards(userId, numAccounts) {
  const accounts = [];
  const cards = [];

  for (let i = 0; i < numAccounts; i++) {
    const account = await createAccount(userId, i === 0 ? 'Checking' : 'Savings');
    accounts.push(account);

    const cardId = generateRandomCardId();
    const card = await prisma.cards.create({
      data: {
        id: cardId,
        cardName: account.name + " card",
        accountNumber: account.id,
        cvv: Math.floor(Math.random() * 900) + 100,
        balance: 1111,
        physical: true,
        PIN: "1234",
      },
    });
    cards.push(card);
  }

  return [accounts, cards];
}

async function createAccount(userId, type) {
  let newAccountNumber = "";
  let account = null;
  do {
    prefix = "7053";
    let randomSuffix = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;

    newAccountNumber = (prefix + randomSuffix);
    account = await prisma.accounts.findUnique({
      where: { id: newAccountNumber }
    });
  } while (account);

  return await prisma.accounts.create({
    data: {
      id: newAccountNumber,
      userId: parseInt(userId),
      balance: 0,
      type,
      name: `${type}_${userId}_FUSE`
    }
  });
}

async function createTransactions(sourceAccounts, destinationAccounts, numTransactions) {
  for (let i = 0; i < numTransactions; i++) {
    const sourceAccount = sourceAccounts[Math.floor(Math.random() * sourceAccounts.length)];
    const destinationAccount = destinationAccounts[Math.floor(Math.random() * destinationAccounts.length)];
    const amount = Math.floor(Math.random() * 1000) + 100;

    await prisma.transactions.create({
      data: {
        amount,
        sourceAccount: sourceAccount.id,
        destinationAccount: destinationAccount.id,
        type: 'Transfer',
      },
    });
  }
}

function generateRandomCardId() {
  let cardId = '';
  for (let i = 0; i < 16; i++) {
    cardId += Math.floor(Math.random() * 10);
  }
  return cardId;
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
