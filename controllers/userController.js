const { body } = require("express-validator");
const { generatePassword } = require("../config/passwordUtils");
const { prisma } = require('../lib/prisma');

async function showSignUpForm(req, res) {
    res.render("sign-up-form");
};

async function handleSignUp(req, res) {
    try {
        // confirm passwords match
        const hashedPassword = await generatePassword(req.body.password);

        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                password: hashedPassword
            }
        });

        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
};


async function showLoginForm(req, res) {
    res.render("login-form");

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
    handleLogOut
};