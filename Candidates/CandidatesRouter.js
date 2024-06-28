const candidatesRouter = require('express').Router();
const candidatesController = require('./CandidatesController')
const { Authentication , simpleAuth } = require('../Auth/Authentication')

candidatesRouter.post('/register', simpleAuth, candidatesController.registerUser)
candidatesRouter.post('/login', simpleAuth, candidatesController.loginUser)
candidatesRouter.post('/reset-password', simpleAuth, candidatesController.resetUserPassword)
candidatesRouter.get('/fetch-alluser', Authentication, candidatesController.getAllCandidates)
candidatesRouter.get('/fetch-user/:userId', Authentication, candidatesController.getUserByCustomeId)

module.exports = candidatesRouter;
