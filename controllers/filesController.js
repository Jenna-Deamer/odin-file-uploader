const { prisma } = require('../lib/prisma');

function showFileCreateForm(req, res) {
    res.render("upload-file");
}

async function handleNewFile(req, res) {

}

module.exports = {
    showFileCreateForm,
    handleNewFile
};