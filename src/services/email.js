const nodemailer = require('nodemailer');
const url        = require('url');

const sftpConfig = require('../config/nodemailer');

const message = {
    from: 'no-reply@localleague.io',
    subject: 'Local League',
};

const getConfirmLink = (payload) => {
    const link = url.format({
        protocol: 'http',
        hostname: 'localhost',
        port: 4200,
        pathname: '/email/confirm',
        query: {
            // attach the user id and the end of the token
            token: `${payload.token}/${payload.userId}`,
        },
    });
    return `<a href="${link}">Confirm email</a>`;
};

const transporter = nodemailer.createTransport(sftpConfig);

exports.send = (payload) => {
    message.html = getConfirmLink(payload);
    message.to = payload.email;
    transporter.sendMail(message, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email was sent');
        }
    });
};
