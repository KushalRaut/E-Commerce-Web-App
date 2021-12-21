const User = require("../models/user");
const jwt = require("jsonwebtoken");

// check if the user is authenticated or not

exports.isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      res.status(401).json({ message: "Login first to access this resource" })
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);

  next();
};

//Handling users roles
exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(req.user.role);
      return next(
        res
          .status(400)
          .json({ message: "You are not allowed to access this resource" })
      );
    }
    next();
  };
};
