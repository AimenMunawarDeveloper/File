const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("Received token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    console.log("Decoded token:", decoded);

    // Check if the token has expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).send({ message: "Token has expired" });
    }

    req.user = decoded;
    next();
  } catch (ex) {
    console.error("Error decoding token:", ex);
    res.status(400).send({ message: "Invalid token." });
  }
};

module.exports = auth;
