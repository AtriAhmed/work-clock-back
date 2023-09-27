import { Response } from "express"
const router = require('express').Router()
const apiRouter = require('express').Router()
const usersRoute = require('./api/users')
const loginRoute = require('./api/login')
const logoutRoute = require('./api/logout')
const accessLevelsRoute = require('./api/accessLevels')


// login route for Users
apiRouter.use('/login', loginRoute)

// logout route for Users
apiRouter.use('/logout', logoutRoute)

// '/api/user' for all routes involving User Accounts
apiRouter.use('/users', usersRoute)

apiRouter.use('/access-levels', accessLevelsRoute)



// API Routes any route starting with '/api'
router.use('/api', apiRouter)

// =========== SEND REACT PRODUCTION BUILD ====================
router.get('*', (res:Response) => {
  res.status(404).send("Route not found")
})

module.exports = router
