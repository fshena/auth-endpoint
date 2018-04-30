require('dotenv').config({ path: process.env.npm_package_config_envFilePath });

const config = {
    dev: {
        query: {
            maxLimit: 100, // max results returned with the response
        },
    },
    test: {
        query: {
            maxLimit: 100, // max results returned with the response
        },
    },
    prod: {
        query: {
            maxLimit: 100, // max results returned with the response
        },
    },
};

module.exports = config[process.env.NODE_ENV];
