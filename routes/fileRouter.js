const { Router } = require("express");
const filesController = require("../controllers/filesController");
const fileRouter = Router();
const { isAuth } = require("./authMiddleware");
const upload = require("../config/mutlerConfig");

fileRouter.get('/upload-file', isAuth, filesController.showFileCreateForm);
fileRouter.post(
    '/upload-file',
    isAuth,
    upload.single('uploaded_file'),
    filesController.handleNewFile
);

module.exports = fileRouter;