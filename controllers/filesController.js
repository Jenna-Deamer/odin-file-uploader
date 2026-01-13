const { prisma } = require('../lib/prisma');

function showFileCreateForm(req, res) {
    res.render("upload-file");
}

async function handleNewFile(req, res) {
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

module.exports = {
    showFileCreateForm,
    handleNewFile
};