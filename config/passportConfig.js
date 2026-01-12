const passport = require("passport");
const { prisma } = require('../lib/prisma');
const LocalStrategy = require('passport-local').Strategy;
const { validatePassword } = require('./passwordUtils');

async function verifyCallback(email, password, done) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        })
        if (!user) {
            return done(null, false)
        }
        const match = await validatePassword(password, user.password);

        if (match) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err);
    }
}

const strategy = new LocalStrategy(
    { usernameField: 'email' },
    verifyCallback
);
passport.use(strategy);


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        return done(null, user);
    } catch (err) {
        console.error('Auth error:', err);
        done(err);
    }
});