const { Router } = require("express");
const passport = require("passport");
const filesController = require("../controllers/filesController");
const fileRouter = Router();
const { isAuth } = require("./authMiddleware");

fileRouter.get('/upload-file', isAuth, filesController.showFileCreateForm);
fileRouter.post('/upload-file', isAuth, filesController.handleNewFile);


module.exports = fileRouter;