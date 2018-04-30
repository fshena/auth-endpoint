const server = require('@localleague/server');

require('./src/routes/index')(server);

module.exports = server;
