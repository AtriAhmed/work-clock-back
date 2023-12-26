import { Response } from "express"
const router = require('express').Router()
const apiRouter = require('express').Router()
const usersRoute = require('./api/users')
const loginRoute = require('./api/login')
const logoutRoute = require('./api/logout')
const accessLevelsRoute = require('./api/accessLevels')
const workLogsRoute = require('./api/workLogs')
const leaveRequestsRoute = require('./api/leaveRequests')
const companySettingsRoute = require('./api/companySettings')
const analyticsRoute = require('./api/analytics')


// login route for Users
apiRouter.use('/login', loginRoute)

// logout route for Users
apiRouter.use('/logout', logoutRoute)

// '/api/user' for all routes involving User Accounts
apiRouter.use('/users', usersRoute)

apiRouter.use('/access-levels', accessLevelsRoute)

apiRouter.use('/work-logs', workLogsRoute)

apiRouter.use('/leave-requests', leaveRequestsRoute)

apiRouter.use('/company-settings', companySettingsRoute)

apiRouter.use('/analytics', analyticsRoute)

// API Routes any route starting with '/api'
router.use('/api', apiRouter)

// =========== SEND REACT PRODUCTION BUILD ====================
router.get('*', (req:any,res:Response) => {
  res.status(404).send("Route not found")
})

module.exports = router
