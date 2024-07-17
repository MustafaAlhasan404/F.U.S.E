const express = require("express");
const helmet = require("helmet");
const cors = require('cors');

const userRoutes = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const beneficiarieRouter = require("./routes/beneficiarieRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const accountRoutes = require("./routes/accountRoutes");
const cardRoutes = require("./routes/cardRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const keyRoutes = require("./routes/keyRoutes");
const billRoutes = require("./routes/billRoutes");
//const encry = require("./middleware/encryptionMiddleware");
const {authenticateJWT} = require('./middleware/authMiddleware');


PORT = process.env.PORT | 3030;

const app = express();

const corsOptions = {
	origin: '*', 
	optionsSuccessStatus: 200 
}

app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(express.json());
app.use(helmet());


app.get("/", async (req, res) => {
	res.json({ msg: "Hello World, I am alive!" });
});

// for payment gateway
app.use("/merchant", merchantRoutes);

app.use("/key", keyRoutes);

app.use("/auth", authRouter);

app.use(authenticateJWT);

app.use("/user", userRoutes);
app.use("/beneficiarie", beneficiarieRouter);
app.use("/account", accountRoutes);
app.use("/card", cardRoutes);
app.use("/transaction", transactionRoutes);
app.use("/bill", billRoutes);

app.listen(PORT, () => {
	console.log("Server listening on port ", PORT);
});
