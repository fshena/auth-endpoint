const objMapper = require('object-mapper');

/**
 * The User entity structure that will be returned in the response.
 * @param {Object} user
 * @return {*}
 */
module.exports = (user) => {
    const src = {
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        password: 'password',
    };
    return objMapper(user, src);
};
