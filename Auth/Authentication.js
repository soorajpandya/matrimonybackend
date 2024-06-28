const jsonwebtoken = require('jsonwebtoken');
const { UNAUTHORIZED, INTERNAL_SERVER_ERROR } = require('../Constant');

const Authentication = async (req, res, next) => {
    try {
        const { token, verify } = req.headers
        if (!token) return res.status(400).send({ message: UNAUTHORIZED })
        // if (!verify || !verify == "664750cb799b73a2ebcf450c") return res.status(400).send({ message: UNAUTHORIZED })
        return jsonwebtoken.verify(token, process.env.JWT_SCREATE, (err, data) => {
            if (data) {
                console.log(data);
                // req.body.userInfo = data
                return next()
            }
            console.log(err);
            return res.status(400).send({ message: UNAUTHORIZED })
        })
    } catch (error) {
        return res.status(500).send({ message: INTERNAL_SERVER_ERROR })
    }
}

const simpleAuth = (req, res, next) => {
    const { verify } = req.headers
    if (!verify || !verify == "664750cb799b73a2ebcf450c") return res.status(400).send({ message: UNAUTHORIZED })
    return next()
}

module.exports = { Authentication, simpleAuth }