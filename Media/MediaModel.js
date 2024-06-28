const mongoose = require("mongoose");

class MediaModel {
    constructor() {
        this.schema = new mongoose.Schema({
            candidateId: { type: mongoose.Types.ObjectId, required:true, ref:"tbl_users" },
            imagesPath: { type: Array, require: true, default: [] },
            documentPath: { type: Array, require: true, default: [] },
            videoPath: { type: String, require: true },
            addressProof : {type:Array , require:true , default:[]}
        }, { timeStamp: true })
        this.model = mongoose.model("tbl_medias", this.schema)
    }
}

const mediaModel = new MediaModel()
module.exports = mediaModel
