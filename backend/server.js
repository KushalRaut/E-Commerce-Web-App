const app = require('./app')
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary')

//Handle the uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`ERROR:${err}`)
  console.log(`Shutting down due to uncaught exception`)
  process.exit(1)
})

//setting up config file
if (process.env.NODE_ENV !== 'PRODUCTTION') {
  const dotenv = require('dotenv')
  dotenv.config({ path: 'backend/config/config.env' })
}

//Connecting to database
connectDatabase()

// Setting up cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server is up on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  )
})

//Handle Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log(`ERROR:${err}`)
  console.log('Shutting down server due to Unhandled Promise Rejection')
  // server.close(() => {
  //   process.exit(1)
  // })
})
