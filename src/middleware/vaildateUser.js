const jwt = require("jsonwebtoken");

const ValidateUser = (req, res, next) => {
  try {
    const userId = req.cookies["token"];

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = jwt.verify(userId, process.env.JWT_SECRET);

    req.headers["user-id"] = id;

    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = { ValidateUser };
