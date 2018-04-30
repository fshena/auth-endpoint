const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const models = require('../../models/index');

/**
 * Create new user entry if the user doesn't already exist.
 * @param {object} newUser
 * @return {Promise<Model, created>}
 */
exports.createUser = (newUser) => {
    const user = newUser;
    user.password = bcrypt.hashSync(newUser.password, 10);
    const conditions = {
        where: {
            [Op.and]: {
                email: user.email,
            },
        },
        defaults: user,
    };
    return models.User.findOrCreate(conditions);
};

/**
 * Check if the user exists in the database.
 * @param {string} email
 * @return {Promise<Model>}
 */
exports.userExists = email => models.User.findOne({
    where: {
        [Op.and]: {
            email,
        },
    },
    raw: true
});

/**
 * Update specific fields of a users entry.
 * @param {numeric} userId
 * @return {Promise<Model>}
 */
exports.activateUser = userId => models.User.update({ is_active: 1 }, {
    where: {
        [Op.and]: {
            id: userId,
        },
    }
});
