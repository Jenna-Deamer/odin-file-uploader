const { Router } = require("express");
const passport = require("passport");
const usersController = require("../controllers/userController");
const usersRouter = Router();


usersRouter.get("/sign-up", usersController.showSignUpForm);
usersRouter.post("/sign-up", usersController.handleSignUp);
usersRouter.get('/login', usersController.showLoginForm);
usersRouter.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
})
);

usersRouter.get("/logout", usersController.handleLogOut);


module.exports = usersRouter;