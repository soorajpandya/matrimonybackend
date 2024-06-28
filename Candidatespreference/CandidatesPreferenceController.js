const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG, MISSING_DEPENDENCY, SUCCESS, DATA_NOT_FOUND, CANDIDATE_ALREADY_APPROVED, ADMIN, PAYMENT_STATUS, CANDIDATE_ALREADY_REJECTED, GENDER } = require("../Constant");
const { candidatePreferenceFields } = require("./CandidatesPreferenceFields");
const candidatePrefrenceModel = require("./CandidatesPreferenceModel");
const mediaModel = require("../Media/MediaModel");
const { uploadFile } = require("../Components")

class CandidatePrefranceController {

    async addCandidatePreference(req, res) {
        try {
            console.log(req.body, "----req.body");
            const { images, video, files, imagesforAdhar } = req.files
            const { candidateId, gender, candidateName, surname, originalSurname, nativePlace, fatherName, motherName, age, mobileNumber, parentContactNumbers, candidateEmail, educationalQualification, mediumOfQualification, house, houseAddress, city, pincode, state, stayingIn, country, dateOfBirth, timeOfBirth, placeOfBirth, maritalStatus, mangalStatus, shuniStatus, work, detailsOfWork, personalIncome, familyIncome, officeWork, height, weight, complexion, bloodGroup, thalassemia, familyMembers, numberOfMarriedSiblings, numberOfUnmarriedSiblings, yourPositionAmongSiblings, numberOfFamilyMembersEarning, diet, hobbies, qualityOfYourPartner, wishToGoAbroadAfterMarriageIfRequired } = req.body;
            const { error, value } = candidatePreferenceFields.validate({ ...req.body });
            if (error) {
                console.log(error);
                return res.status(400).send({ message: MISSING_DEPENDENCY, error: error.details[0].message });
            }
            const keysToConvertToNumber = ['age', 'pincode', 'mobileNumber', 'parentContactNumbers', 'personalIncome', 'familyIncome'];
            req.body.hobbies = req.body.hobbies.split(',').map(hobby => hobby.trim());

            const parsedBody = Object.fromEntries(
                Object.entries(req.body).map(([key, value]) => [
                    key,
                    keysToConvertToNumber.includes(key) ?
                        (isNaN(parseFloat(value)) ? value : parseFloat(value)) :
                        value
                ])
            );

            let imageData = uploadFile(images)
            const videoData = uploadFile(video)
            const filesData = uploadFile(files, "Doc")
            const AddressProfe = uploadFile(imagesforAdhar, "AddressProfe")
            imageData.videoPath = videoData.videoPath
            imageData.documentPath = filesData.documentPath
            imageData.addressProof = AddressProfe.addressProof
            console.log(imageData, "----imageData")

            const uploadData = await mediaModel.model.create({ candidateId: parsedBody.candidateId, ...imageData })
            if (!uploadData) return res.state(400).send({ message: SOMETHING_WENT_WRONG })

            const result = await candidatePrefrenceModel.model.create({ ...parsedBody, image: uploadData._id })
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            if (error.code === 1100) {
                return res.status(400).send({ message: "Value Already Exists", value: error.keyValue })
            }
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async filterCandidatesByPreference(req, res) {
        try {
            console.log(req.body, "----req.body");
            const { candidateId, weight, complexion, bloodGroup, height } = req.body;
            const id = candidateId;
            const filterKeys = Object.keys(req.body).filter(key => key !== 'candidateId');
            let filter = {};
            filterKeys.forEach(key => {
                filter[key] = req.body[key];
            });
            const candidate = await candidatePrefrenceModel.model.findOne({ candidateId: id });
            if (!candidate) {
                return res.status(400).send({ message: "The candidate is not registered. Please ensure the registration details are correct." })
            }
            const genderFilter = candidate.gender == 'GenderEnum.male' ? { gender: 'GenderEnum.female' } : { gender: 'GenderEnum.male' };
            filter = { ...filter, ...genderFilter };
            let age = req.body.age
            if (age) {
                const ageRange = age.split(" to ").map(Number).sort((a, b) => a - b); // Split age range string, convert to numbers, and sort
                if (ageRange.length === 2 && !isNaN(ageRange[0]) && !isNaN(ageRange[1])) {
                    const ageFilter = { age: { $gte: ageRange[0], $lte: ageRange[1] } };
                    filter = { ...filter, ...ageFilter };
                }
            }
            // if (height) {
            //     const heightRange = height.split(" to ").map(Number).sort((a, b) => a - b); // Split height range string, convert to numbers, and sort
            //     if (heightRange.length === 2 && !isNaN(heightRange[0]) && !isNaN(heightRange[1])) {
            //         const heightFilter = { height: { $gte: heightRange[0], $lte: heightRange[1] } };
            //         filter = { ...filter, ...heightFilter };
            //     }
            // }

           
            const candidates = await candidatePrefrenceModel.model.aggregate([
                { $match: filter },
                { $lookup: { from: "tbl_users", localField: "candidateId", foreignField: "_id", as: "candidateId" } },
                { $unwind: "$candidateId" },
                { $lookup: { from: "tbl_medias", localField: "image", foreignField: "_id", as: "image" } },
                { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        candidateId: 1,
                        gender: 1,
                        candidateName: 1,
                        surname: 1,
                        originalSurname: 1,
                        nativePlace: 1,
                        fatherName: 1,
                        motherName: 1,
                        age: 1,
                        mobileNumber: 1,
                        parentContactNumbers: 1,
                        candidateEmail: 1,
                        educationalQualification: 1,
                        mediumOfQualification: 1,
                        house: 1,
                        houseAddress: 1,
                        pincode: 1,
                        stayingIn: 1,
                        dateOfBirth: 1,
                        timeOfBirth: 1,
                        placeOfBirth: 1,
                        maritalStatus: 1,
                        mangalStatus: 1,
                        shaniStatus: 1,
                        work: 1,
                        detailsOfWork: 1,
                        personalIncome: 1,
                        familyIncome: 1,
                        officeWork: 1,
                        height: 1,
                        weight: 1,
                        complexion: 1,
                        bloodGroup: 1,
                        thalassemia: 1,
                        familyMembers: 1,
                        numberOfMarriedSiblings: 1,
                        numberOfUnmarriedSiblings: 1,
                        yourPositionAmongSiblings: 1,
                        numberOfFamilyMembersEarning: 1,
                        country: 1,
                        state: 1,
                        city: 1,
                        diet: 1,
                        hobbies: 1,
                        qualityOfYourPartner: 1,
                        wishToGoAbroadAfterMarriageIfRequired: 1,
                        image: {
                            $cond: {
                                if: { $eq: ["$image", null] },
                                then: null,
                                else: {
                                    _id: "$image._id",
                                    candidateId: "$image.candidateId",
                                    imagesPath: {
                                        $map: {
                                            input: "$image.imagesPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    documentPath: {
                                        $map: {
                                            input: "$image.documentPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    videoPath: { $concat: [`${process.env.URL}`, "$image.videoPath"] },
                                    addressProof: {
                                        $map: {
                                            input: "$image.addressProof",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    __v: "$image.__v"
                                }
                            }
                        }
                    }
                }
            ]);
            console.log(candidates, "-----candidates")
            if (candidates.length <= 0) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: candidates });
        } catch (error) {
            console.log(error);
            throw new Error("Error filtering candidates: " + error.message);
        }
    }

    async GetCandidatePreference(req, res) {
        try {
            const result = await candidatePrefrenceModel.model.aggregate([
                {
                    $match: {
                        adminStatus: ADMIN.PENDING,
                        paymentStatus: PAYMENT_STATUS.PENDING
                    }
                },
                {
                    $lookup: { from: "tbl_medias", localField: "image", foreignField: "_id", as: "image" },
                },
                {
                    $unwind: { path: "$image", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        candidateId: 1,
                        gender: 1,
                        candidateName: 1,
                        surname: 1,
                        originalSurname: 1,
                        nativePlace: 1,
                        fatherName: 1,
                        motherName: 1,
                        age: 1,
                        mobileNumber: 1,
                        parentContactNumbers: 1,
                        candidateEmail: 1,
                        educationalQualification: 1,
                        mediumOfQualification: 1,
                        house: 1,
                        houseAddress: 1,
                        pincode: 1,
                        stayingIn: 1,
                        dateOfBirth: 1,
                        timeOfBirth: 1,
                        placeOfBirth: 1,
                        maritalStatus: 1,
                        mangalStatus: 1,
                        shaniStatus: 1,
                        work: 1,
                        detailsOfWork: 1,
                        personalIncome: 1,
                        familyIncome: 1,
                        officeWork: 1,
                        height: 1,
                        weight: 1,
                        complexion: 1,
                        bloodGroup: 1,
                        thalassemia: 1,
                        familyMembers: 1,
                        numberOfMarriedSiblings: 1,
                        numberOfUnmarriedSiblings: 1,
                        yourPositionAmongSiblings: 1,
                        numberOfFamilyMembersEarning: 1,
                        country: 1,
                        state: 1,
                        city: 1,
                        diet: 1,
                        hobbies: 1,
                        qualityOfYourPartner: 1,
                        wishToGoAbroadAfterMarriageIfRequired: 1,
                        image: {
                            $cond: {
                                if: { $eq: ["$image", null] },
                                then: null,
                                else: {
                                    _id: "$image._id",
                                    candidateId: "$image.candidateId",
                                    imagesPath: {
                                        $map: {
                                            input: "$image.imagesPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    documentPath: {
                                        $map: {
                                            input: "$image.documentPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    videoPath: { $concat: [`${process.env.URL}`, "$image.videoPath"] },
                                    addressProof: {
                                        $map: {
                                            input: "$image.addressProof",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    __v: "$image.__v"
                                }
                            }
                        }
                    }
                }
            ])

            if (!result || result.length === 0) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async GetApprovedCandidatePreference(req, res) {
        try {
            const result = await candidatePrefrenceModel.model.aggregate([
                {
                    $match: {
                        adminStatus: ADMIN.APPROVED,
                        paymentStatus: PAYMENT_STATUS.APPROVED
                    }
                },
                {
                    $lookup: { from: "tbl_medias", localField: "image", foreignField: "_id", as: "image" },
                },
                {
                    $unwind: { path: "$image", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        candidateId: 1,
                        gender: 1,
                        candidateName: 1,
                        surname: 1,
                        originalSurname: 1,
                        nativePlace: 1,
                        fatherName: 1,
                        motherName: 1,
                        age: 1,
                        mobileNumber: 1,
                        parentContactNumbers: 1,
                        candidateEmail: 1,
                        educationalQualification: 1,
                        mediumOfQualification: 1,
                        house: 1,
                        houseAddress: 1,
                        pincode: 1,
                        stayingIn: 1,
                        dateOfBirth: 1,
                        timeOfBirth: 1,
                        placeOfBirth: 1,
                        maritalStatus: 1,
                        mangalStatus: 1,
                        shaniStatus: 1,
                        work: 1,
                        detailsOfWork: 1,
                        personalIncome: 1,
                        familyIncome: 1,
                        officeWork: 1,
                        height: 1,
                        weight: 1,
                        complexion: 1,
                        bloodGroup: 1,
                        thalassemia: 1,
                        familyMembers: 1,
                        numberOfMarriedSiblings: 1,
                        numberOfUnmarriedSiblings: 1,
                        yourPositionAmongSiblings: 1,
                        numberOfFamilyMembersEarning: 1,
                        country: 1,
                        state: 1,
                        city: 1,
                        diet: 1,
                        hobbies: 1,
                        qualityOfYourPartner: 1,
                        wishToGoAbroadAfterMarriageIfRequired: 1,
                        image: {
                            $cond: {
                                if: { $eq: ["$image", null] },
                                then: null,
                                else: {
                                    _id: "$image._id",
                                    candidateId: "$image.candidateId",
                                    imagesPath: {
                                        $map: {
                                            input: "$image.imagesPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    documentPath: {
                                        $map: {
                                            input: "$image.documentPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    videoPath: { $concat: [`${process.env.URL}`, "$image.videoPath"] },
                                    addressProof: {
                                        $map: {
                                            input: "$image.addressProof",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    __v: "$image.__v"
                                }
                            }
                        }
                    }
                }
            ])

            if (!result || result.length === 0) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async UpdateAdminApproval(req, res) {
        try {
            const { _id } = req.body;
            if (!_id) return res.status(400).send({ message: MISSING_DEPENDENCY })
            const check = await candidatePrefrenceModel.model.findOne({ _id: _id })
            if (!check) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
            if (check.adminStatus === ADMIN.APPROVED || check.adminStatus === ADMIN.REJECTED) {
                const message = check.adminStatus === ADMIN.APPROVED
                    ? CANDIDATE_ALREADY_APPROVED
                    : CANDIDATE_ALREADY_REJECTED;
                return res.status(400).send({ message });
            }
            const result = await candidatePrefrenceModel.model.findByIdAndUpdate({ _id: _id }, { adminStatus: ADMIN.APPROVED }, { new: true }).populate([{ path: "image" }, { path: "candidateId" }])
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })

            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async UpdateAdminRejection(req, res) {
        try {
            const { _id, remarks } = req.body;
            if (!_id) return res.status(400).send({ message: MISSING_DEPENDENCY })

            const check = await candidatePrefrenceModel.model.findOne({ _id: _id })
            if (!check) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
            if (check.adminStatus === ADMIN.APPROVED || check.adminStatus === ADMIN.REJECTED) {
                const message = check.adminStatus === ADMIN.APPROVED
                    ? CANDIDATE_ALREADY_APPROVED
                    : CANDIDATE_ALREADY_REJECTED;
                return res.status(400).send({ message });
            }
            const result = await candidatePrefrenceModel.model.findByIdAndUpdate({ _id: _id }, { adminStatus: ADMIN.REJECTED }, { ...req.body }, { new: true }).populate([{ path: "image" }, { path: "candidateId" }])
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })

            return res.status(200).send({ message: SUCCESS, data: result })

        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async UpdatePaymentApprovalStatus(req, res) {
        try {
            const { _id } = req.body;
            if (!_id) return res.status(400).send({ message: MISSING_DEPENDENCY })

            const check = await candidatePrefrenceModel.model.findOne({ _id: _id })
            if (!check) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
            if (check.paymentStatus === PAYMENT_STATUS.APPROVED || check.paymentStatus === PAYMENT_STATUS.REJECTED) {
                const message = check.paymentStatus === PAYMENT_STATUS.APPROVED
                    ? CANDIDATE_ALREADY_APPROVED
                    : CANDIDATE_ALREADY_REJECTED;
                return res.status(400).send({ message });
            }
            const result = await candidatePrefrenceModel.model.findByIdAndUpdate({ _id: _id }, { paymentStatus: PAYMENT_STATUS.APPROVED }, { new: true }).populate([{ path: "image" }, { path: "candidateId" }])
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })

            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async UpdatePaymentRejectionStatus(req, res) {
        try {
            const { _id } = req.body;
            if (!_id) return res.status(400).send({ message: MISSING_DEPENDENCY })

            const check = await candidatePrefrenceModel.model.findOne({ _id: _id })
            if (!check) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
            if (check.paymentStatus === PAYMENT_STATUS.APPROVED || check.paymentStatus === PAYMENT_STATUS.REJECTED) {
                const message = check.paymentStatus === PAYMENT_STATUS.APPROVED
                    ? CANDIDATE_ALREADY_APPROVED
                    : CANDIDATE_ALREADY_REJECTED;
                return res.status(400).send({ message });
            }
            const result = await candidatePrefrenceModel.model.findByIdAndUpdate({ _id: _id }, { paymentStatus: PAYMENT_STATUS.REJECTED }, { new: true }).populate([{ path: "image" }, { path: "candidateId" }])
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })

            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async GetCandidatePreferenceById(req, res) {
        try {
            const { candidateId } = req.body
            const result = await candidatePrefrenceModel.model.aggregate([
                {
                    $match: {
                        candidateId: new mongoose.Types.ObjectId(candidateId),
                        adminStatus: ADMIN.PENDING,
                        paymentStatus: PAYMENT_STATUS.PENDING
                    }
                },
                {
                    $lookup: { from: "tbl_medias", localField: "image", foreignField: "_id", as: "image" },
                },
                {
                    $unwind: { path: "$image", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        candidateId: 1,
                        gender: 1,
                        candidateName: 1,
                        surname: 1,
                        originalSurname: 1,
                        nativePlace: 1,
                        fatherName: 1,
                        motherName: 1,
                        age: 1,
                        mobileNumber: 1,
                        parentContactNumbers: 1,
                        candidateEmail: 1,
                        educationalQualification: 1,
                        mediumOfQualification: 1,
                        house: 1,
                        houseAddress: 1,
                        pincode: 1,
                        stayingIn: 1,
                        dateOfBirth: 1,
                        timeOfBirth: 1,
                        placeOfBirth: 1,
                        maritalStatus: 1,
                        mangalStatus: 1,
                        shaniStatus: 1,
                        work: 1,
                        detailsOfWork: 1,
                        personalIncome: 1,
                        familyIncome: 1,
                        officeWork: 1,
                        height: 1,
                        weight: 1,
                        complexion: 1,
                        bloodGroup: 1,
                        thalassemia: 1,
                        familyMembers: 1,
                        numberOfMarriedSiblings: 1,
                        numberOfUnmarriedSiblings: 1,
                        yourPositionAmongSiblings: 1,
                        numberOfFamilyMembersEarning: 1,
                        country: 1,
                        state: 1,
                        city: 1,
                        diet: 1,
                        hobbies: 1,
                        qualityOfYourPartner: 1,
                        wishToGoAbroadAfterMarriageIfRequired: 1,
                        image: {
                            $cond: {
                                if: { $eq: ["$image", null] },
                                then: null,
                                else: {
                                    _id: "$image._id",
                                    candidateId: "$image.candidateId",
                                    imagesPath: {
                                        $map: {
                                            input: "$image.imagesPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    documentPath: {
                                        $map: {
                                            input: "$image.documentPath",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    videoPath: { $concat: [`${process.env.URL}`, "$image.videoPath"] },
                                    addressProof: {
                                        $map: {
                                            input: "$image.addressProof",
                                            as: "path",
                                            in: { $concat: [`${process.env.URL}`, "$$path"] }
                                        }
                                    },
                                    __v: "$image.__v"
                                }
                            }
                        }
                    }
                }
            ])

            if (!result || result.length === 0) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async GetMaleCandidatePreference(req, res) {
        try {
            const result = await candidatePrefrenceModel.model.find({ gender: GENDER.MALE, adminStatus: ADMIN.PENDING, paymentStatus: PAYMENT_STATUS.PENDING }).populate([{ path: "image" }, { path: "candidateId" }])
            if (!result || result.length === 0) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR })
        }
    }

    async GetFemaleCandidatePreference(req, res) {
        try {
            const result = await candidatePrefrenceModel.model.find({ gender: GENDER.FEMALE, adminStatus: ADMIN.PENDING, paymentStatus: PAYMENT_STATUS.PENDING }).populate([{ path: "image" }, { path: "candidateId" }])

            if (!result || result.length === 0) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR })
        }
    }

    async UpdateCandidateProfile(req, res) {
        try {
            const { candidateId } = req.body
            const { images, video } = req.files

            const candidateData = await candidatePrefrenceModel.model.findById(candidateId)

            if (!candidateData) {
                throw new Error('Candidate not found');
            }

            const currentYear = new Date().getFullYear();
            const lastUpdatedYear = candidateData.lastUpdatedAt ? candidateData.lastUpdatedAt.getFullYear() : null;

            if (lastUpdatedYear === currentYear && candidateData.updateCount >= 3) {
                throw new Error('You have reached the update limit for this year');
            }

            if (lastUpdatedYear !== currentYear) {
                req.body.updateCount = 1;
            } else {
                req.body.updateCount += 1;
            }
            req.body.lastUpdatedAt = new Date();
            let imageData = uploadFile(images)
            const videoData = uploadFile(video)
            imageData.videoPath = videoData.videoPath
            const uploadData = await mediaModel.model.updateOne({ candidateId: candidateId, ...imageData })
            if (!uploadData) return res.state(400).send({ message: SOMETHING_WENT_WRONG })
            const updateCandidateProfile = await candidatePrefrenceModel.model.updateOne({ candidateId: candidateId }, { ...req.body })

            if (updateCandidateProfile.nModified <= 0) {
                return res.status(400).send({ message: SOMTHING_WENT_WRONG })
            }

            return res.status(200).send({ message: SUCCESS })
        } catch (error) {
            console.log(error)
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }
}
const candidatePrefranceController = new CandidatePrefranceController()
module.exports = candidatePrefranceController
