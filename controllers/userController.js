const { body } = require("express-validator");
const { generatePassword } = require("../config/passwordUtils");
const { prisma } = require('../lib/prisma');
const passport = require("passport");

function showSignUpForm(req, res) {
    if (req.user) {
        res.redirect("/")
    } else {
        res.render("sign-up-form");
    }
};

async function handleSignUp(req, res, next) {
    try {
        // confirm passwords match
        const hashedPassword = await generatePassword(req.body.password);

        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                password: hashedPassword
            }
        });

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        next(error);
    }
};


function showLoginForm(req, res) {
    if (req.user) {
        res.redirect("/")
    } else {
        res.render("login-form");
    }
}

function handleLogin(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).render("login-form", {
                errors: [{ msg: info?.message || "Login failed" }]
            });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect("/");
        });
    })(req, res, next);
}

function handleLogOut(req, res, next) {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
}



module.exports = {
    showSignUpForm,
    handleSignUp,
    showLoginForm,
    handleLogin,
    handleLogOut,
};