// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    // console.log(token);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded)
        req.user = { id: decoded.id , role: decoded.role};
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token is not valid" });
    }
};

module.exports = authMiddleware;
