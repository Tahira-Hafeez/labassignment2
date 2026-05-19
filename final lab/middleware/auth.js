const jwt = require('jsonwebtoken');

// ── For EJS pages (session-based) ──
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.flash("error", "Please log in to access this page");
        res.redirect("/login");
    }
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === "admin") {
        next();
    } else {
        req.flash("error", "Access denied. Admins only.");
        res.redirect("/login");
    }
}

// ── For API routes (JWT-based) ──
function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const tokenfinal = authHeader.split(" ")[1];
        const decoded = jwt.verify(tokenfinal, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = { isLoggedIn, isAdmin, verifyToken };