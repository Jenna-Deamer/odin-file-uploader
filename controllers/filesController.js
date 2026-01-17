const { prisma } = require('../lib/prisma');
const { supabase } = require('../lib/supabase');

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

        const { originalname, size, buffer, mimetype } = req.file;

        // Create a unique file name for Supabase 
        const fileName = `${Date.now()}-${originalname}`;
        const selectedFolderId = req.body.folder ? parseInt(req.body.folder) : null;

        // Upload to Supabase 
        const { data, error } = await supabase.storage
            .from("files")
            .upload(fileName, buffer, {
                contentType: mimetype,
                upsert: false
            });

        if (error) throw error;

        // Get url from Supabase
        const { data: urlData } = supabase.storage
            .from("files")
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // Create refrence in DB with url 
        await prisma.file.create({
            data: {
                name: originalname,
                size: size,
                url: publicUrl,
                userId: req.user.id,
                folderId: selectedFolderId
            }
        });

        res.redirect("/");
    } catch (error) {
        console.error("Error in file upload process:", error);
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

async function showUpdateFolderForm(req, res) {
    const folderId = parseInt(req.params.id);
    const folder = await prisma.folder.findUnique({
        where: {
            id: folderId,
        }
    });

    res.render("update-folder", { folder });
}

async function updateFolderById(req, res, next) {
    try {
        const folderId = parseInt(req.params.id);
        const updatedName = req.body.name;

        await prisma.folder.update({
            where: { id: folderId },
            data: { name: updatedName }

        });
        res.redirect("/");
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
            const { originalname, size, buffer, mimetype } = req.file;
            const fileName = `${Date.now()}-${originalname}`;

            const { data, error } = await supabase.storage
                .from("files")
                .upload(fileName, buffer, {
                    contentType: mimetype,
                    upsert: false
                });

            if (error) throw error;

            // get new url from supabase
            const { data: urlData } = supabase.storage
                .from("files")
                .getPublicUrl(fileName);


            updateData.name = originalname;
            updateData.size = size;
            updateData.url = urlData.publicUrl;
        }


        await prisma.file.update({
            where: { id: fileId },
            data: updateData
        });

        res.redirect("/");
    } catch (error) {
        console.error("Error updating file:", error);
        next(error);
    }
}

async function deleteFile(req, res, next) {
    const fileId = parseInt(req.query.file_id);

    try {
        await prisma.file.delete({
            where: {
                id: fileId,
            }
        })

        res.redirect("/");
    } catch (error) {
        next(error);
    }
}

async function deleteFolder(req, res, next) {
    const folderId = parseInt(req.query.folder_id);

    const folder = await prisma.folder.findUnique({
        where: {
            id: folderId,
        },
        include: {
            files: true
        }
    });

    if (folder.files.length > 0) {

        // remove folder from all files 
        await prisma.file.updateMany({
            where: {
                folderId: folderId
            },
            data: {
                folderId: null
            }
        });

        await prisma.folder.delete({
            where: {
                id: folderId
            }
        });

        res.redirect("/");

    } else {
        await prisma.folder.delete({
            where: {
                id: folderId
            }
        });

        res.redirect("/");
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
    updateFileById,
    deleteFile,
    showUpdateFolderForm,
    updateFolderById,
    deleteFolder

};