const path = require("node:path");
const express = require("express");
const session = require("express-session");
require("dotenv").config();
const passport = require("passport");
require("./config/passportConfig");
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma/client.js');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });


const userRouter = require("./routes/userRouter");
const fileRouter = require("./routes/fileRouter.js");


const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");


app.use(
    session({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000 // ms
        },
        secret: 'a santa at nasa',
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            prisma,
            {
                checkPeriod: 2 * 60 * 1000,  //ms
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }
        )
    })
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter);
app.use(fileRouter);

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});


app.get("/", async (req, res, next) => {
    try {
        res.render("index", {
            user: req.user,
        });
    } catch (err) {
        next(err);
    }
});

app.listen(3000, (error) => {
    if (error) {
        throw error;
    }
    console.log("app listening on port 3000!");
});