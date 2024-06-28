const mongoose = require('mongoose');

class CandidatePrefrenceModel {
    constructor() {
        this.schema = new mongoose.Schema({
            candidateId: { type: mongoose.Types.ObjectId, required: true, ref: "tbl_users" },
            gender: { type: String, required: true },
            candidateName: { type: String, required: true },
            surname: { type: String, required: true },
            originalSurname: { type: String, required: true },
            nativePlace: { type: String, required: true },
            fatherName: { type: String, required: true },
            motherName: { type: String, required: true },
            age: { type: Number, required: true },
            mobileNumber: { type: Number, unique: true, required: true },
            parentContactNumbers: { type: Number, unique: true, required: true },
            candidateEmail: { type: String, required: true, unique: true },
            educationalQualification: { type: String, required: true },
            mediumOfQualification: { type: String, required: true },
            house: { type: String, required: true },
            houseAddress: { type: String, required: true },
            permanentAddress : {type:String , required:true},
            abroadHouseAddress: { type: String, default: null },
            pincode: { type: Number, required: true },
            stayingIn: { type: String, required: true },
            dateOfBirth: { type: String, required: true },
            timeOfBirth: { type: String, required: true },
            placeOfBirth: { type: String, required: true },
            maritalStatus: { type: String, required: true },
            mangalStatus: { type: String, required: true },
            shaniStatus: { type: String, required: true },
            work: { type: String, required: true },
            detailsOfWork: { type: String, required: true },
            personalIncome: { type: Number, required: true },
            familyIncome: { type: Number, required: true },
            officeWork: { type: String, required: true },
            height: { type: String, required: true },
            weight: { type: String, required: true },
            complexion: { type: String, required: true },
            bloodGroup: { type: String, required: true },
            thalassemia: { type: String, required: true },
            familyMembers: { type: String, required: true },
            numberOfMarriedSiblings: { type: String, required: true },
            numberOfUnmarriedSiblings: { type: String, required: true },
            yourPositionAmongSiblings: { type: String, required: true },
            numberOfFamilyMembersEarning: { type: String, required: true },
            country: { type: String, required: true },
            state: { type: String, required: true },
            city: { type: String, required: true },
            abroadCountry: { type: String, default: null },
            abroadState: { type: String, default: null },
            abroadCity: { type: String, default: null },
            diet: { type: String, required: true },
            hobbies: { type: Array, required: true },
            qualityOfYourPartner: { type: String, required: true },
            wishToGoAbroadAfterMarriageIfRequired: { type: String, required: true },
            image: { type: mongoose.Types.ObjectId, require: true, ref: "tbl_medias" },
            adminStatus: { type: String, default: "Pending" },
            paymentStatus: { type: String, default: "Pending" },
            status: { type: String, default: "Pending" },
            remarks:{type:String,default:"Pending"},
            updateCount: { type: Number, default: 0 },
            lastUpdatedAt: { type: Date, default: null },
        }, { timestamps: true });

        this.model = new mongoose.model("tbl_candidates", this.schema);
    }
}

const candidatePrefrenceModel = new CandidatePrefrenceModel();
module.exports = candidatePrefrenceModel;