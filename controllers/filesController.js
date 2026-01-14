const { prisma } = require('../lib/prisma');

async function showFileCreateForm(req, res, next) {
    try {
        const folders = await getAllFoldersByUserId(req.user.id);

        res.render("upload-file", { folders });
    } catch (error) {
        console.error("Error fetching folders:", error);
        next(error);
    }
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
        if (req.body.folder && req.body.folder !== "") {
            // Convert id selected to Int
            selectedFolderId = parseInt(req.body.folder);
        } else {
            // None selected set to null
            selectedFolderId = null;
        }

        await prisma.file.create({
            data: {
                name: originalname,
                size: size,
                url: filePath,
                userId: req.user.id,
                folderId: selectedFolderId

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