const User = require('../models/user')
const { sendToken } = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

// register a user => /api/user/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'avatars',
    width: 150,
    crop: 'scale',
  })

  const { name, email, password, role } = req.body

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
    role,
  })

  sendToken(user, 200, res)
})

//Login user => /api/user/login

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(
      res.status(400).json({ message: 'Please enter correct credentials' })
    )
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(res.status(400).json({ message: 'User not found' }))
  }

  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(res.status(400).json({ message: 'unauthorized user' }))
  }

  sendToken(user, 200, res)
}

// Forgot Password =>/api/user/password/forgot
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(
      res.status(400).json({ message: 'No user found with that email' })
    )
  }

  // get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  // Create reset password url
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

  const message = `Your Password reset token is as follow:\n\n${resetUrl} If you gave not requested this mail then ignore it.`

  try {
    await sendEmail({
      email: user.email,
      subject: 'ShopIT password Recovery',
      message,
    })

    res.status(200).json({
      success: true,
      message: `email sent to ${user.email}`,
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(
      res
        .status(500)
        .json({ message: 'the operation of password reset failed' })
    )
  }
}

//Get currently logged in user details /api/v1/me
exports.getUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    user,
  })
}

//update/change password => /api/v1/password/update

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  const isMatched = await user.comparePassword(req.body.oldPassword)
  if (!isMatched) {
    return next(res.status(400).json({ message: 'Old passowrd is incorrect' }))
  }

  user.password = req.body.newPassword
  await user.save()

  sendToken(user, 200, res)
}

//update user profile => api/v1/me/update
exports.updateProfile = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }

  if (req.body.avatar !== '') {
    const user = await User.findById(req.user.id)

    const image_id = user.avatar.public_id
    const res = await cloudinary.v2.uploader.destroy(image_id)

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    })

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true })
}

// reset password at /api/v1/password/reset/:token
exports.resetPassword = async (req, res, next) => {
  //hash the url token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(
      res
        .status(400)
        .json({ message: 'reset password token is invalid or time expired' })
    )
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(res.status(400).json({ message: 'password does not match' }))
  }

  user.password = req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, 200, res)
}

exports.logOut = async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    message: 'User logged out',
  })
}

//admin routes

//get all users => /api/v1/admin/users
exports.allUsers = async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    success: true,
    users,
  })
}

//get user details => /api/vq/admin/user/:id
exports.getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      res.status(400).json({ success: false, message: 'User not found' })
    )
  }

  res.status(200).json({ success: true, user })
}

//update user profile => api/v1/admin/user/:id
exports.updateUser = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true })
}

//delete user profile => api/v1/admin/user/:id
exports.deleteUser = async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      res.status(400).json({ success: false, message: 'User not found' })
    )
  }
  //remove the image from cloudinary

  await user.remove()
  res.status(200).json({ success: true })
}
