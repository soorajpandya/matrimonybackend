const AdminRouter = require('express').Router();
const adminController = require('./AdminController');
const { Authentication , simpleAuth } = require('../Auth/Authentication')

AdminRouter.post("/register", simpleAuth, adminController.AdminRegister)
AdminRouter.post("/login", simpleAuth, adminController.AdminLogin),
    AdminRouter.get("/fetch-user/:userId", Authentication, adminController.GetParticulerUser)
AdminRouter.get("/fetch-all-user", Authentication, adminController.GetAllUSer)
AdminRouter.get("/fetchuser-byrole/:role", Authentication, adminController.GetUserByRole)
AdminRouter.put("/update-user", Authentication, adminController.UpdateUser)
AdminRouter.delete("/delete-user/:userId", Authentication, adminController.DeleteUser)
AdminRouter.put("/update-password", simpleAuth, adminController.UpdatePassword)

module.exports = AdminRouter