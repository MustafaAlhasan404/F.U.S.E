Add to your .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/FUSE_DB"
JWT_SECRET=.....

Run:
npm install
npx prisma migrate dev --name "init"
npx prisma generate

-----------------------------------------------------


