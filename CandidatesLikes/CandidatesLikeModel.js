const { default: mongoose } = require("mongoose");

class CandidatesLikeModel {
    constructor() {
        this.schema = new mongoose.Schema({
            candidateId: { type: mongoose.Types.ObjectId, required: true, ref: "tbl_users" },
            likeTo: { type: mongoose.Types.ObjectId, required: true, ref: "tbl_users" },
            likeStatus: { type: Boolean, default: false },
            requestStatus: { type: String, default: "none" },
            chatStatus: { type: String, default: "none" },
            bothIntrested: { type: String, default: "none" },
            favourite: { type: Boolean, default: false },
            requestSentAt: { type: Date, default: null}, 
        }, { timestamps: true })

        // Create compound index on candidateId and likeTo for efficient querying
        this.schema.index({ candidateId: 1, likeTo: 1 });

        this.model = new mongoose.model('tbl_likes', this.schema)
    }
}

const candidateLikeModel = new CandidatesLikeModel()
module.exports = candidateLikeModel