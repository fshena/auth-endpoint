const authController = require('../controllers/auth-controller');

module.exports = (server) => {
    server.post(
        { path: '/auth/signup', name: 'postSignUp' },
        authController.signup
    );
    server.get(
        { path: '/auth/confirm', name: 'getConfirm' },
        authController.confirmEmail
    );
    server.post(
        { path: '/auth/signin', name: 'postSignIn' },
        authController.signin
    );
};
