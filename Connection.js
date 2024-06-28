const mongoose = require("mongoose");
async function ConnectDb() {
    try {
        await mongoose.connect(process.env.MONGODB)
        console.log("Db Connected");
    } catch (error) {
        console.log(error);
        console.log("Db Connection Loss");
    }
}

module.exports = ConnectDb   