const { prisma } = require('../lib/prisma');

function showFileCreateForm(req, res) {
    res.render("upload-file");
}

function showFolderCreateForm(req, res) {
    res.render("new-folder");

}

async function handleNewFile(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).send("No file was uploaded.");
        }
        const { originalname, size, path: filePath } = req.file;

        await prisma.file.create({
            data: {
                name: originalname,
                size: size,
                url: filePath,
                userId: req.user.id,

            }
        });

        res.redirect("/");
    } catch (error) {
        console.error("Error saving file to DB:", error);
        next(error);
    }
}

async function handleNewFolder(req, res, next) {
    try {
        await prisma.folder.create({
            data: {
                userId: req.user.id,
                name: req.body.name,
            }
        });

        res.redirect("/");
    } catch (error) {
        console.error("Error creating folder", error);
        next(error);
    }
}
async function getAllFilesByUserId(userId) {
    return prisma.file.findMany({
        where: { userId }
    });
}

async function getAllFoldersByUserId(userId) {
    return prisma.folder.findMany({
        where: { userId }
    });
}

module.exports = {
    showFileCreateForm,
    handleNewFile,
    getAllFilesByUserId,
    getAllFoldersByUserId,
    showFolderCreateForm,
    handleNewFolder
};