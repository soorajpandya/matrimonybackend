const candidateLikeModel = require('./CandidatesLikeModel');
const { verifyAddlikesFeild } = require('./CandidatesLikeFields');
const { SOMETHING_WENT_WRONG, INTERNAL_SERVER_ERROR, SUCCESS, LIKE_ADDED_SUCCESSFULLY, DATA_NOT_FOUND, MISSING_DEPENDENCY, STATUS } = require('../Constant')
class CandidatesLikesController {

    async addCandidateLike(req, res) {
        try {
            const { candidateId, likeTo } = req.body;
            console.log(req.body);
            return
            const { error, value } = verifyAddlikesFeild.validate({ candidateId, likeTo });
            if (error) return res.status(400).json({ message: MISSING_DEPENDENCY, error: error.details[0].message });
            const existingLike = await candidateLikeModel.model.findOne({ candidateId, likeTo });
            if (existingLike) {
                if (existingLike.likeStatus === true) {
                    const unLike = await candidateLikeModel.model.updateOne({ _id: existingLike._id }, { likeStatus: false });
                    if (unLike.modifiedCount === 0) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
                    return res.status(200).send({ message: 'Like removed successfully' });
                } else {
                    const addLike = await candidateLikeModel.model.updateOne({ _id: existingLike._id }, { likeStatus: true })
                    if (addLike.modifiedCount === 0) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
                    return res.status(200).send({ message: 'Like add successfully' });
                }
            } else {
                const newLike = await candidateLikeModel.model.create({ candidateId, likeTo, likeSatus: true });
                if (!newLike) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
                return res.status(200).send({ message: LIKE_ADDED_SUCCESSFULLY });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message });
        }
    }


    async getPerticularCandidateLikes(req, res) {
        try {
            const { id } = req.params
            if (!id) return res.status(400).send({ message: "id is required" })
            const result = await candidateLikeModel.model.find({ candidateId: id }).populate(
                [
                    { path: "candidateId" },
                    { path: "likeTo" },
                ]
            )
            if (!result) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async getUsersWith20OrMoreLikes(req, res) {
        try {
            const result = await candidateLikeModel.model.aggregate([
                {
                    $group: {
                        _id: "$candidateId",
                        likeCount: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        likeCount: { $gte: 20 }
                    }
                },
                {
                    $lookup: {
                        from: 'tbl_users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $lookup: {
                        from: 'tbl_candidates',
                        localField: '_id',
                        foreignField: 'candidateId',
                        as: 'userDetails.prefrencesDetails'
                    },
                },
                {
                    $unwind: "$userDetails.prefrencesDetails"
                },
                {
                    $lookup: {
                        from: 'tbl_medias',
                        localField: '_id',
                        foreignField: 'candidateId',
                        as: 'userDetails.prefrencesDetails.image'
                    },
                },
                {
                    $project: {
                        "userDetails.password": 0,
                        "userDetails.prefrencesDetails.image._id": 0,
                        "userDetails.prefrencesDetails.image.candidateId": 0,
                        "userDetails.prefrencesDetails.image.fileName": 0,
                        "userDetails.prefrencesDetails.image.videoPath": 0,
                    }
                }
            ]);
            if (!result || result.length <= 0) return res.status(400).send({ message: DATA_NOT_FOUND });
            return res.status(200).send({ message: SUCCESS, data: result });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message });
        }
    }

    async addProfileInFavourite(req, res) {
        try {
            const { candidateId, likeTo } = req.body
            const { error, value } = verifyAddlikesFeild.validate({ candidateId, likeTo });
            if (error) return res.status(400).json({ message: MISSING_DEPENDENCY, error: error.details[0].message });
            const existingFav = await candidateLikeModel.model.findOne({ candidateId, likeTo });
            if (existingFav) {
                const addToFav = await candidateLikeModel.model.updateOne({ _id: existingFav._id }, { favourite: true });
                if (!addToFav) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
                return res.status(200).send({ message: 'Add to favourite successfully' });
            } else {
                const newFav = candidateLikeModel.model.create({ candidateId, likeTo, favourite: true });
                if (!newFav) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
                return res.status(200).send({ message: LIKE_ADDED_SUCCESSFULLY });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async listFavouriteProfile(req, res) {
        try {
            const { id } = req.params
            if (!id) return res.status(400).send({ message: "id is required" })
            const result = await candidateLikeModel.model.find({ candidateId: id, favourite: true }).populate(
                [
                    { path: "candidateId" },
                    { path: "likeTo" },
                ]
            )
            if (!result) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async requestForProfileMatch(req, res) {
        try {
            console.log(req.body, "---body")
            const { candidateId, likeTo } = req.body;
            const candidateCheck = await candidateLikeModel.model.find({ candidateId: candidateId, requestStatus: { $in: [STATUS.ACCEPTED, STATUS.PENDING] } })
            const liketoCheck = await candidateLikeModel.model.find({ likeTo: candidateId, requestStatus: { $in: [STATUS.ACCEPTED] } })

            const exist = await candidateLikeModel.model.findOne({ candidateId: candidateId, likeTo: likeTo , requestStatus: STATUS.PENDING })
            console.log(exist, "----exist");

            if(exist) return res.status(400).send({ message: "Request Already Sent" })

            const mergeData = candidateCheck.concat(liketoCheck)
            if (mergeData.length >= 2) return res.status(400).send({ message: "Your Profile Already Accepted with 2 People" })

            const requestExist = await candidateLikeModel.model.find({ candidateId: candidateId, likeTo: likeTo });
            let result
            console.log(requestExist, "-------requestExist")
            if (requestExist.length > 0) {
                if (requestExist.requestStatus === "Pending") {
                    result = await candidateLikeModel.model.updateOne(
                        { _id: requestExist._id },
                        { requestStatus: "none", requestSentAt: null }
                    );
                    if (!result) return res.status(400).send({ message: 'SOMETHING_WENT_WRONG' });
                } else {
                    result = await candidateLikeModel.model.updateOne(
                        { _id: requestExist._id },
                        { requestStatus: "Pending", requestSentAt: new Date() }
                    );
                    if (!result) return res.status(400).send({ message: 'SOMETHING_WENT_WRONG' });
                }
            } else {
                const data = {
                    candidateId: candidateId,
                    likeTo: likeTo,
                    requestStatus: "Pending",
                    requestSentAt: new Date()
                };
                result = await candidateLikeModel.model.create({ ...data });
                console.log(result, "----result")
                if (!result) return res.status(400).send({ message: 'SOMETHING_WENT_WRONG' });
            }

            const populatedResult = await candidateLikeModel.model.aggregate([
                { $match: { _id: result._id } },
                // {
                //     $lookup: {
                //         from: 'tbl_candidates',
                //         localField: 'candidateId',
                //         foreignField: '_id',
                //         as: 'candidate'
                //     }
                // },
                // { $unwind: '$candidate' },
                // {
                //     $lookup: {
                //         from: 'tbl_medias',
                //         localField: 'candidate.image',
                //         foreignField: '_id',
                //         as: 'image'
                //     }
                // },
                // { $unwind: { path: '$image', preserveNullAndEmptyArrays: true } },
                // {
                //     $project: {
                //         _id: 1,
                //         candidateId: 1,
                //         likeTo: 1,
                //         requestStatus: 1,
                //         candidate: 1,
                //         image: {
                //             $cond: {
                //                 if: { $eq: ["$image", null] },
                //                 then: null,
                //                 else: {
                //                     _id: "$image._id",
                //                     candidateId: "$image.candidateId",
                //                     imagesPath: {
                //                         $map: {
                //                             input: "$image.imagesPath",
                //                             as: "path",
                //                             in: { $concat: [`${process.env.URL}`, "$$path"] }
                //                         }
                //                     },
                //                     documentPath: {
                //                         $map: {
                //                             input: "$image.documentPath",
                //                             as: "path",
                //                             in: { $concat: [`${process.env.URL}`, "$$path"] }
                //                         }
                //                     },
                //                     videoPath: { $concat: [`${process.env.URL}`, "$image.videoPath"] },
                //                     addressProof: {
                //                         $map: {
                //                             input: "$image.addressProof",
                //                             as: "path",
                //                             in: { $concat: [`${process.env.URL}`, "$$path"] }
                //                         }
                //                     },
                //                     __v: "$image.__v"
                //                 }
                //             }
                //         }
                //     }
                // }
            ]);

            console.log(populatedResult, "----populatedResult");

            if (!populatedResult || populatedResult.length === 0) return res.status(400).send({ message: 'SOMETHING_WENT_WRONG' });
            return res.status(200).send({ message: 'SUCCESS', data: populatedResult[0] });


        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: 'INTERNAL_SERVER_ERROR', error: error.message });
        }
    }

    async getUserPandingRequest(req, res) {
        try {
            const { id } = req.params
            if (!id) return res.status(400).send({ message: "id is required" })
            const result = await candidateLikeModel.model.find({ likeTo: id, likeStatus: false }).populate(
                [
                    { path: "candidateId" },
                    { path: "likeTo" }
                ]
            )
            if (!result) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async AcceptProfile(req, res) {
        try {
            const { id } = req.params
            if (!id) return res.status(400).send({ message: "id is required" })
            const result = await candidateLikeModel.model.updateOne({ _id: id }, { requestStatus: "Accepted" })
            if (!result.modifiedCount > 0) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: SUCCESS })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async RejectProfile(req, res) {
        try {
            const { id } = req.params
            if (!id) return res.status(400).send({ message: "id is required" })
            const result = await candidateLikeModel.model.updateOne({ _id: id }, { requestStatus: "Rejected" })
            if (!result.modifiedCount > 0) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: SUCCESS })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }









    




    //  pls make onther controllers upper because below controller used in cron job
    async removeRequest() {
        try {
            console.log("hali gay lya ma faday gy")
            const currentDate = new Date();
            const cutoffDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
    
            // Remove all requests with status "Pending" older than 30 days
            const result = await candidateLikeModel.model.deleteMany({
                requestStatus: "Pending",
                requestSentAt: { $lt: cutoffDate }
            });
            console.log(result);
        } catch (error) {
            console.log(error)
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR })
        }
    }

}
const candidatesLikesController = new CandidatesLikesController()
module.exports = candidatesLikesController