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

async function showFolderDetails(req, res, next) {
    try {
        const folderId = parseInt(req.params.id);

        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
            },
            include: {
                files: true
            }
        });

        if (!folder || folder.userId !== req.user.id) {
            return res.status(404).send("Folder not found or unauthorized");
        }

        res.render("folder", { folder });
    } catch (error) {
        next(error);
    }
}

async function showFileDetials(req, res, next) {
    try {
        const fileId = parseInt(req.params.id);

        const file = await prisma.file.findUnique({
            where: {
                id: fileId,
            }
        });

        console.log(file)

        if (!file || file.userId !== req.user.id) {
            return res.status(404).send("File not found or unauthorized");
        }

        res.render("file", { file });
    } catch (error) {
        next(error);
    }
}

async function showUpdateFileForm(req, res) {
    const fileId = parseInt(req.params.id);
    const folders = await getAllFoldersByUserId();
    const file = await prisma.file.findUnique({
        where: {
            id: fileId,
        }
    });
    res.render("update-file", { file, folders });

}
async function updateFileById(req, res, next) {
    try {
        const fileId = parseInt(req.params.id);
        const selectedFolderId = req.body.folder ? parseInt(req.body.folder) : null;

        const updateData = {
            folderId: selectedFolderId,
        };

        if (req.file) {
            updateData.name = req.file.originalname;
            updateData.size = req.file.size;
            updateData.url = req.file.path;
        }

        await prisma.file.update({
            where: { id: fileId },
            data: updateData
        });

        res.redirect("/");
    } catch (error) {
        next(error);
    }
}


module.exports = {
    showFileCreateForm,
    handleNewFile,
    getAllFilesByUserId,
    getAllFoldersByUserId,
    showFolderCreateForm,
    handleNewFolder,
    showFolderDetails,
    showFileDetials,
    showUpdateFileForm,
    updateFileById
};