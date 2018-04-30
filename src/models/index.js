const { db }       = require('@localleague/database');
const userModel    = require('./user-model');
const emailConfirm = require('./email_confirm-model');

const models = [
    emailConfirm,
    userModel
];

module.exports = db.loadModels(models);
