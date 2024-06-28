
const { mongoose } = require('mongoose');

class AdminModel{
    constructor() {
        this.schema = new mongoose.Schema({
            userName: { type: String, required: true },
            email: { type: String, },
            password: { type: String },
            phone: { type: String },
            role: { type: String, required: true },
        }, { timestamps: true });
       
        this.model = mongoose.model('tbl_admin', this.schema);
    }
}

const adminModel = new AdminModel();
module.exports = adminModel;