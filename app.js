const express = require('express')
const cors = require('cors')
const ConnectDb = require('./Connection');
const fileUpload = require("express-fileupload");
const locationRouter = require('./country-state-city/locationRoutes');
const AdminRouter = require("./Admin/AdminRouter")
const candidatesRouter = require('./Candidates/CandidatesRouter');
const CandidatesPreferenceRouter = require("./Candidatespreference/CandidatesPreferenceRouter")
const { SUCCESS } = require('./Constant');
const { Authentication } = require('./Auth/Authentication');
const candidatesLikesController = require('./CandidatesLikes/CandidatesLikesController')
const candidatesLikesRouter = require('./CandidatesLikes/CandidatesLikeRouter');
const cron = require('node-cron');
require("dotenv").config()
const app = express()


app.use(cors())
app.use(express.json())
ConnectDb()
app.use(fileUpload())

app.use("/public", express.static("./public"))
app.get("/", (_, res) => res.status(200).send({ message: SUCCESS, status: true }))

app.use("/api", Authentication, locationRouter)
app.use("/admin", AdminRouter)
app.use("/candidate", candidatesRouter)
app.use("/preference", Authentication, CandidatesPreferenceRouter)
app.use("/candidate-like", candidatesLikesRouter)


cron.schedule('0 2 * * *', async() => {
  console.log("hali gay lya ma faday gy");
  await candidatesLikesController.removeRequest()
}, {
  timezone: 'Asia/Kolkata' // Set your timezone here
});


app.listen(process.env.PORT, () => {
  console.log("server started");
})
