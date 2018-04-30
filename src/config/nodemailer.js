require('dotenv').config({ path: process.env.npm_package_config_envFilePath });

const config = {
    dev: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: 'f6e35aa7a91bfe',
            pass: '27ab3edb903e76',
        },
    },
    test: {
    },
    prod: {
    },
};

module.exports = config[process.env.NODE_ENV];
