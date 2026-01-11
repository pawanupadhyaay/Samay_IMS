const jwt = require("jsonwebtoken");

// Middleware for user authentication
function userAuth(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // @ts-ignore
  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(401).send("Invalid token.");
    }

    // @ts-ignore
    if (decoded.role !== "user") {
      return res.status(403).send("Access denied. No permission.");
    }

    req.user = decoded; // Attach decoded user data to the request object
    next();
  });
}

// Middleware for admin authentication
function adminAuth(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // @ts-ignore
  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(401).send("Invalid token.");
    }

    // @ts-ignore
    if (decoded.role !== "admin") {
      return res.status(403).send("Access denied. No permission.");
    }

    req.user = decoded; // Attach decoded admin data to the request object
    next();
  });
}

module.exports = {
  userAuth,
  adminAuth,
};