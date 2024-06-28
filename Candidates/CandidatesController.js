const candidatesModel = require('./CandidatesModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { registerUserFields, resetUserPasswordFields } = require('./CandidatesFields');
const { SOMETHING_WENT_WRONG, SUCCESS, INTERNAL_SERVER_ERROR, PHONE_ALREADY_EXISTS, EMAIL_ALREADY_EXISTS, USER_NOT_EXISTS, PASSWORD_NOT_MATCH, MISSING_DEPENDENCY, CANDIDATES_ROLE } = require("../Constant")

class CandidatesController {

    async registerUser(req, res) {
        try {
            const { userName, email, password, phone, role, createdBy, googleAuth } = req.body
            console.log(req.body);
            // const { error, value } = registerUserFields.validate({ userName, role });
            if (role == CANDIDATES_ROLE.GUARDIAN && !createdBy) return res.status(400).send({ message: MISSING_DEPENDENCY, error: "createdBy is required" })
            // if (error) return res.status(400).json({ message: MISSING_DEPENDENCY, error: error.details[0].message });

            const userId = `BPT-${Math.floor(1000 + Math.random() * 9000)}`
            if (googleAuth) {
                let existingUser = await candidatesModel.model.findOne({ email });
                if (existingUser?._doc) { existingUser = existingUser?._doc }
                if (existingUser) {
                    delete existingUser.password
                    const token = jwt.sign({ ...existingUser }, process.env.JWT_SCREATE)
                    return res.status(200).send({ message: SUCCESS, data: { ...existingUser, token } });
                } else {
                    let newUser = await candidatesModel.model.create({
                        userId,
                        userName,
                        email,
                        role,
                        googleAuth
                    });
                    if (!newUser) return res.status(400).send({ message: SOMETHING_WENT_WRONG });
                    if (newUser._doc) { newUser = newUser?._doc }
                    delete newUser.password
                    const token = jwt.sign({ ...newUser }, process.env.JWT_SCREATE)
                    return res.status(200).send({ message: SUCCESS, data: { ...newUser, token } });
                }
            }

            if (email) {
                const verfyEmail = await candidatesModel.model.findOne({ email })
                if (verfyEmail) return res.status(400).send({ message: EMAIL_ALREADY_EXISTS })
            }

            if (phone) {
                const verfyPhone = await candidatesModel.model.findOne({ phone })
                if (verfyPhone) return res.status(400).send({ message: PHONE_ALREADY_EXISTS })
            }

            const confirmPassword = bcrypt.hashSync(password, 8)
            let result = await candidatesModel.model.create({
                userId,
                userName,
                ...(email ? { email } : { phone }),
                phone,
                password: confirmPassword,
                role,
                createdBy,
            });

            if (!result) return res.status(400).send({ message: SOMETHING_WENT_WRONG })
            result = result._doc
            delete result.password

            const token = jwt.sign({ ...result }, process.env.JWT_SCREATE)
            return res.status(200).send({ message: SUCCESS, data: { ...result, token } })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password, phone, googleAuth } = req.body

            if (googleAuth) {
                let updateUser = await candidatesModel.model.findOneAndUpdate({ email }, { googleAuth })
                if (!updateUser) return res.status(400).send({ message: USER_NOT_EXISTS })
                updateUser = updateUser?._doc
                if (updateUser.password) delete updateUser.password
                const token = jwt.sign({ email }, process.env.JWT_SCREATE)
                return res.status(200).send({ message: SUCCESS, data: { ...updateUser, token } })
            }

            let query = {};
            if (email) {
                query.email = email;
            } else if (phone) {
                query.phone = phone;
            }

            let result = await candidatesModel.model.findOne({ ...query });
            if (!result) return res.status(400).send({ message: USER_NOT_EXISTS })
            if (!result.password) return res.status(400).send({ message: PASSWORD_NOT_MATCH })
            result = result._doc

            const isMatch = bcrypt.compareSync(password, result.password);
            if (!isMatch) return res.status(400).send({ message: PASSWORD_NOT_MATCH });
            delete result.password

            const token = jwt.sign({ ...result }, process.env.JWT_SCREATE)
            return res.status(200).send({ message: SUCCESS, data: { ...result, token } })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async getAllCandidates(req, res) {
        try {
            const result = await candidatesModel.model.find({ role: CANDIDATES_ROLE.CANDIDATE }).select({ password: 0 })
            if (!result) return res.status(400).send({ message: USER_NOT_EXISTS })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async resetUserPassword(req, res) {
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
            const result = await candidatesModel.model.findOneAndUpdate(query, { password: encryptedPassword })
            if (!result) return res.status(400).send({ message: USER_NOT_EXISTS })
            return res.status(200).send({ message: SUCCESS })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

    async getUserByCustomeId(req, res) {
        try {
            const { userId } = req.params
            if (!userId) return res.status(400).send({ message: MISSING_DEPENDENCY })
            let result = await candidatesModel.model.findOne({ userId: userId })
            if (!result) return res.status(400).send({ message: USER_NOT_EXISTS })
            return res.status(200).send({ message: SUCCESS, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message })
        }
    }

}
const candidatesController = new CandidatesController()
module.exports = candidatesController;
