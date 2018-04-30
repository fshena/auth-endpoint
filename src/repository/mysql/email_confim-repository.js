const { Op } = require('sequelize');
const models = require('../../models/index');

/**
 * Create an email confirm token for a specific user
 * and store it into the database.
 * @param {{user_id: number, token: string, expires: number}} payload
 * @return {Promise<Model, created>}
 */
exports.createToken = payload => models.EmailConfirm.findOrCreate({
    where: {
        [Op.and]: {
            user_id: payload.user_id,
        },
    },
    defaults: payload,
});

/**
 * Find email confirmation toke.
 * @param {{userId: number, token: string}} payload
 * @return {Promise<Model>}
 */
exports.findToken = payload => models.EmailConfirm.findOne({
    where: {
        [Op.and]: {
            user_id: payload.userId,
            token: payload.token
        },
    },
    raw: true,
});


/**
 * Delete specific email verification token.
 * @param {{user_id: number, token: string, expires: number}} payload
 * @return {Promise<Model>}
 */
exports.removeToken = payload => models.EmailConfirm.destroy({
    where: {
        [Op.and]: {
            user_id: payload.userId,
            token: payload.token,
        },
    },
});
