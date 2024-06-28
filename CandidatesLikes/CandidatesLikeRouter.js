const candidatesLikesRouter = require("express").Router()
const candidatesLikesController = require('./CandidatesLikesController');

candidatesLikesRouter.post('/add-like', candidatesLikesController.addCandidateLike)
candidatesLikesRouter.get('/get-mostLiked', candidatesLikesController.getUsersWith20OrMoreLikes)
candidatesLikesRouter.post('/add-favourite', candidatesLikesController.addProfileInFavourite)
candidatesLikesRouter.post('/requestformatch', candidatesLikesController.requestForProfileMatch)
candidatesLikesRouter.get('/get-favourite/:id', candidatesLikesController.listFavouriteProfile)
candidatesLikesRouter.get('/get-userPandingRequest/:id', candidatesLikesController.getUserPandingRequest)
candidatesLikesRouter.get('/accept-profile/:id', candidatesLikesController.AcceptProfile)
candidatesLikesRouter.get('/reject-profile/:id', candidatesLikesController.RejectProfile)
candidatesLikesRouter.get('/get-like/:id', candidatesLikesController.getPerticularCandidateLikes)

module.exports = candidatesLikesRouter