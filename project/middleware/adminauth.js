// Middleware to check if the user is an admin
function adminauth(req, res, next) {
    if (req.session && req.session.isAdmin) {
        req.session.isAdmin=false;
        return next(); // Proceed if authenticated as admin
    }
    return res.status(403).send('Forbidden: Admins only.');
}

module.exports = { adminauth };
