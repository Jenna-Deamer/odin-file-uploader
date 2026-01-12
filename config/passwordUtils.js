const bcrypt = require('bcryptjs');

async function generatePassword(password) {
    return await bcrypt.hash(password, 10);

}

async function validatePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    validatePassword,
    generatePassword
}