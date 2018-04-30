require('dotenv').config({ path: process.env.npm_package_config_envFilePath });

const httpStatus = require('http-status-codes');
const JWT        = require('jsonwebtoken');


/**
 * Check if the token is valid, if yes, refresh the token and
 * send the new one, otherwise return null.
 * @param {Object} req
 * @param {Object} res
 */
exports.verify = (req, res) => {
    const authHeader = req.headers.authorization || false;
    if (!authHeader) {
        res.status(httpStatus.UNAUTHORIZED);
        res.json();
    } else {
        // TODO: renew token
        // remove the "Bearer" text from the "authorization" header
        const jwtToken = authHeader.replace(/Bearer /g, '');
        JWT.verify(jwtToken, process.env.JWT_TOKEN_SECRET, (err) => {
            const token = err ? null : jwtToken;
            res.status(httpStatus.OK);
            res.json({ token });
        });
    }
};
