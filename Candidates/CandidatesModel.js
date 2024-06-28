const { default: mongoose } = require('mongoose');
class CandidatesModel {
    constructor() {
        this.schema = new mongoose.Schema({
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            email: { type: String, },
            password: { type: String },
            phone: { type: String },
            role: { type: String, required: true },
            relation: { type: String },
            createdBy: { type: mongoose.Schema.Types.ObjectId },
            googleAuth: { type: Boolean, default: false },
        }, { timestamps: true })

        this.model = new mongoose.model("tbl_users", this.schema)
    }
}
const candidatesModel = new CandidatesModel()
module.exports = candidatesModel