//create and send token in the cookie
exports.sendToken = (user, statusCode, res) => {
  //create Jwt token
  const token = user.getJWTToken();

  //options for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httponly: true,
  };

  

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};
