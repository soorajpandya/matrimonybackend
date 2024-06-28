const adminModel = require("./AdminModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const joi = require('joi')
const { resetUserPasswordFields } = require('../Candidates/CandidatesFields');
const { MISSING_DEPENDENCY,DATA_NOT_FOUND, SOMETHING_WENT_WRONG, SUCCESS, INTERNAL_SERVER_ERROR, USER_NOT_EXISTS, PASSWORD_NOT_MATCH, DELETE_SUCCESSFULLY, EMAIL_ALREADY_EXISTS, PHONE_ALREADY_EXISTS } = require("../Constant");

const { adminCreate, adminLoginfield } = require('./AdminFields')



class AdminController {

    async AdminRegister(req, res) {
        try {
            const { userName, email, password, role, phone, googleAuth } = req.body;
            console.log(req.body);
            const { error, value } = adminCreate.validate({ userName, role });
            if (error) {
                return res.status(400).json({ message: MISSING_DEPENDENCY, error: error.details[0].message });
            }
            if (email) {
                const verfyEmail = await adminModel.model.findOne({ email })
                if (verfyEmail) return res.status(400).send({ message: EMAIL_ALREADY_EXISTS })
            }
            if (phone) {
                const verfyPhone = await adminModel.model.findOne({ phone })
                if (verfyPhone) return res.status(400).send({ message: PHONE_ALREADY_EXISTS })
            }
            // if (googleAuth) {
            //     const existingAdmin = await adminModel.model.findOne({email})
            //     if (existingAdmin) {
            //             return res.status(200).send({message:SUCCESS , data:existingAdmin})
            //     } else {
            //         const result = await adminModel.model.create({ userName, email, role, googleAuth })
            //         if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            //         const token = jwt.sign({ email }, process.env.JWT_SCREATE)
            //         return res.status(200).send({ message: SUCCESS, data: { token, ...result._doc } }) 
            //     }
            // }

            const EncryptPassword = bcrypt.hashSync(password, 8)
            if (!EncryptPassword) return res.status(400).send({ message: SOMETHING_WENT_WRONG })

            let result = await adminModel.model.create({
                userName,
                ...(email ? { email } : { phone }),
                password: EncryptPassword,
                role
            })
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            result = result._doc
            delete result.password

            const token = jwt.sign({ ...result }, process.env.JWT_SCREATE)
            if (!token) res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: SUCCESS, data: { token, ...result } })

        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async AdminLogin(req, res) {
        try {
            const { email, phone, password, googleAuth } = req.body
            // if (googleAuth) {
            //     const updateUser = await adminModel.model.findOneAndUpdate({ email }, { googleAuth })
            //     if (!updateUser) return res.status(400).send({ message: USER_NOT_EXISTS })
            //     const token = jwt.sign({ email }, process.env.JWT_SCREATE)
            //     return res.status(200).send({ message: SUCCESS, data: { token, ...updateUser._doc } })
            // }

            let query = {};
            if (email) {
                query.email = email;
            } else if (phone) {
                query.phone = phone;
            }

            let result = await adminModel.model.findOne({...query})
            result = result._doc
            if (!result) return res.status(400).send({ message: USER_NOT_EXISTS })
            const VerifyPassword = bcrypt.compareSync(password, result.password)
            if (!VerifyPassword) return res.status(400).send({ message: PASSWORD_NOT_MATCH })
            delete result.password
            const token = jwt.sign({ ...result }, process.env.JWT_SCREATE)
            if (!token) res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: SUCCESS, data: { token, ...result } })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async GetParticulerUser(req, res) {
        try {
            const { userId } = req.params
            if (!userId) return res.status(400).send({ message: MISSING_DEPENDENCY })
            const result = await adminModel.model.findOne({ _id: userId })
            if (!result) return res.status(400).send({ message: USER_NOT_EXISTS })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async GetAllUSer(req, res) {
        try {
            const result = await adminModel.model.find()
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async GetUserByRole(req, res) {
        try {
            const { role } = req.params
            if (!role) return res.status(400).send({ message: MISSING_DEPENDENCY })
            const result = await adminModel.model.find({ role: role })
            if(result.length == 0) return res.status(400).send({ message: DATA_NOT_FOUND })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async UpdateUser(req, res) {
        try {
            const { userId } = req.body
            if (!userId) return res.status(400).send({ message: MISSING_DEPENDENCY })
            const result = await adminModel.model.findOneAndUpdate({ _id: userId }, { ...req.body }, { new: true })
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async DeleteUser(req, res) {
        try {
            const { userId } = req.params
            if (!userId) return res.status(400).send({ message: MISSING_DEPENDENCY })
            const result = await adminModel.model.findOneAndDelete({ _id: userId })
            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            return res.status(200).send({ message: DELETE_SUCCESSFULLY, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async UpdatePassword(req, res) {
        try {
            const { email, phone, password } = req.body
            const { error, value } = resetUserPasswordFields.validate({ password });
            if (error) return res.status(400).json({ message: MISSING_DEPENDENCY, error: error.details[0].message });
            let query = {};
            if (email) {
                query.email = email;
            } else if (phone) {
                query.phone = phone;
            }
            const encryptedPassword = bcrypt.hashSync(password, 8)
            const result = await adminModel.model.findOneAndUpdate(query, { password: encryptedPassword })
            if (!result) return res.status(400).send({ message: USER_NOT_EXISTS })
            return res.status(200).send({ message: SUCCESS , data:result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }
}

const adminController = new AdminController();
module.exports = adminController;