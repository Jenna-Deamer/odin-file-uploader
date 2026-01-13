function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/');
        // res.status(401).json({ message: 'You are not authorized to view this resource please login.' });
    }
}
module.exports = {
    isAuth,

};