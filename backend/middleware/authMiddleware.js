// authMiddleware.js
const admin = require("../firebase.js");
// const User = require("../models/user.js");

async function verifyUser(req, res, next) {
  req.user = {
    uid: 'boobachad',
    email: 'boobachaddd@gmail.com',
    admin: true
  };
  return next();

  /*
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // attaches user data to req
        if(User.findOne({adminId: decodedToken.uid})){
          req.user.admin = true;
        }
    }
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
  */
}

module.exports = { verifyUser };