const Errors      = require('restify-errors');
const httpStatus  = require('http-status-codes');
const crypto      = require('crypto');
const moment      = require('moment');
const bcrypt      = require('bcrypt');
const _           = require('lodash');
const JWT         = require('jsonwebtoken');
const basicAuth   = require('basic-auth');
const cookie      = require('cookie');

const emailService         = require('../services/email');
const postUserDto          = require('../dto/users/post-dto');
const getUserDto           = require('../dto/users/get-dto');
const userMySqlRepository  = require('../repository/mysql/user-repository');
const emailMySqlRepository = require('../repository/mysql/email_confim-repository');
const errorHandler         = require('./error-controller');

/**
 * Check if the confirm link has expired.
 * @param expires
 * @return {boolean}
 */
const isValidConfirmLink = (expires) => {
    const expiresTimestamp = moment(expires).valueOf();
    const currentTimestamp = moment(new Date()).valueOf();
    return expiresTimestamp < currentTimestamp;
};

/**
 * Create a random token for the confirmation link.
 * @param userId
 * @return {{user_id: number, token: string, expires: number}}
 */
const getConfirmLinkToken = userId => ({
    user_id: userId,
    token: crypto.randomBytes(64).toString('hex'),
    expires: moment(new Date()).add({ days: 1 }).valueOf(),
});

/**
 * Create the JWT token.
 * @param {string} host
 * @param {string} userEmail
 * @param {string} firstName
 * @return {{iss: string, aud: *, iat: number, exp: number, email: *, preferred_username: *}}
 */
const getJwtToken = ({ host, userEmail, firstName }) => {
    const payload = {
        iss: 'localleague.io',
        aud: host,
        iat: Math.floor(Date.now() / 1000), // the time JWT was issued
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
        email: userEmail,
        preferred_username: firstName,
    };
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };
    return JWT.sign(payload, process.env.JWT_TOKEN_SECRET, { header });
};

/**
 * Create new user, create new verification token, store them
 * and send an email containing the verification link.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.signup = async (req, res, next) => {
    try {
        const [newUser, userCreated] = await userMySqlRepository
            .createUser(postUserDto(req.body));
        // no new user was created because it already exists.
        if (!userCreated) {
            return next(new Errors.UnprocessableEntityError({
                code: httpStatus.UNPROCESSABLE_ENTITY,
            }, 'User already exists'));
        }
        // transform to plain js object
        const user = newUser.get({ plain: true });
        const [emailToken, tokenCreated] = await emailMySqlRepository
            .createToken(getConfirmLinkToken(user.id));
        if (!tokenCreated) {
            return next(new Errors.UnprocessableEntityError({
                code: httpStatus.UNPROCESSABLE_ENTITY,
            }, 'Token has already been created'));
        }
        // transform to plain js object
        const email = emailToken.get({ plain: true });
        emailService.send({
            email: user.email,
            token: email.token,
            userId: user.id,
        });
        res.status(httpStatus.CREATED);
        return res.json();
    } catch (errors) {
        return next(new Errors.UnprocessableEntityError({
            code: httpStatus.UNPROCESSABLE_ENTITY,
        }, 'Error during sign up'));
    }
};

/**
 * Get the email and the token from the request and
 * verify it against the database.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.confirmEmail = async (req, res, next) => {
    // get user id from token
    const data = {
        token: req.params.token.split('/')[0],
        userId: req.params.token.split('/')[1]
    };
    // find user email token in the db
    const result = await emailMySqlRepository.findToken(data);
    if (_.isNil(result)) {
        return next(new Errors.UnauthorizedError({
            code: httpStatus.UNAUTHORIZED,
        }, 'Incorrect confirm link'));
    }
    // check expiry date
    if (isValidConfirmLink()) {
        await emailMySqlRepository.removeToken(data);
        return next(new Errors.UnauthorizedError({
            code: httpStatus.UNAUTHORIZED,
        }, 'Confirm link has expired'));
    }
    const sendResponse = (updated) => {
        emailMySqlRepository.removeToken(data);
        const status = updated[0] ? httpStatus.OK : httpStatus.EXPECTATION_FAILED;
        res.status(status);
        return res.json();
    };
    userMySqlRepository
        .activateUser(data.userId)
        .then(sendResponse)
        .catch(errors => errorHandler.model(errors, next));
};

/**
 * Create a JWT token from the login credentials and return it to the user.
 * @param {Object} req
 * @param {Object} res
 */
exports.signin = (req, res) => {
    const login = basicAuth(req);
    // check if user exists in the database, "username" has the email value
    userMySqlRepository.userExists(login.name).then((user) => {
        if (!user) {
            res.status(httpStatus.UNAUTHORIZED);
            return res.json();
        }
        // check if the encrypted password is correct
        bcrypt.compare(login.pass, user.password, (err, valid) => {
            if (!valid) {
                res.status(httpStatus.UNAUTHORIZED);
                return res.json();
            }
            const userDto = getUserDto.map(user);
            const accessToken = getJwtToken({
                host: req.headers.host,
                userEmail: userDto.email,
                firstName: userDto.firstName
            });
            res.header('Sec-Cookie', cookie.serialize('session', accessToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 12, // 12 hours
                path: '/',
                // secure: true,
                // domain: ''
            }));
            res.status(httpStatus.OK);
            return res.json({ accessToken });
        });
    });
};
