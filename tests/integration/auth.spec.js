require('dotenv').config();

const moment          = require('moment');
const chai            = require('chai');
const chaiHttp        = require('chai-http');
const models          = require('../../src/models/index');
const userRepository  = require('../../src/repository/mysql/user-repository');
const emailRepository = require('../../src/repository/mysql/email_confim-repository');
const server          = require('../../devServer');
const expect          = chai.expect;
const assert          = chai.assert;

chai.use(chaiHttp);

const userRecord = {
    firstName: 'Florian',
    lastName: 'Shena',
    email: 'florian.shena@gmail.com',
    password: 'password',
    roleId: 0,
    isActive: 0
};

describe('Auth Endpoint', () => {
    before(async () => {
        await models.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
        // delete table and create it again
        await models.User.sync({force: true});
        await models.EmailConfirm.sync({force: true});
        await models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    });
    describe('POST /auth/signup', () => {
        it('should create a new user and email verification token in the DB', done => {
            chai.request(server)
                .post('/auth/signup')
                .send(userRecord)
                .end(async (err, res) => {
                    expect(res).to.have.status(201);
                    // get the user from the database
                    const newUser = await models.User.findOne({
                        where: { email:userRecord.email }, raw: true
                    });
                    expect(newUser).to.be.an('object');
                    // get the email verification token from the database
                    const token = await models.EmailConfirm.findOne({
                        where: { user_id: newUser.id, }, raw: true,
                    });
                    expect(token).to.be.an('object');
                    done();
                });
        });
    });
    describe('GET /auth/confirm', () => {
        before(async () => {
            // delete table and create it again
            await models.EmailConfirm.sync({force: true});
            await models.EmailConfirm.create({
                user_id: 1,
                token: '123456',
                expires: moment(new Date()).add({days: 1}).valueOf()
            });
        });
        it('should verify the email and remove entry from the DB', done => {
            chai.request(server)
                .get('/auth/confirm')
                .query({token: '123456/1'})
                .end(async (err, res) => {
                    expect(res).to.have.status(200);
                    const user = await userRepository.userExists(userRecord.email);
                    expect(user).to.be.an('object');
                    assert.equal(user.is_active, true, 'User is active');
                    const confirmToken = await emailRepository.findToken({
                        userId: 1,
                        token: '123456'
                    });
                    expect(confirmToken).to.equal(null);
                    done();
                });
        });
        it('should return unauthorized because of invalid link', done => {
            chai.request(server)
                .get('/auth/confirm')
                .query({token: '123456/2'})
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done();
                });
        });
        it('should return unauthorized because of expired link', done => {
            models.EmailConfirm.create({
                user_id: 2,
                token: '1234567',
                expires: moment(new Date()).subtract({days: 1}).valueOf()
            }).then(() => {
                chai.request(server)
                    .get('/auth/confirm')
                    .query({token: '1234567/2'})
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

        });
    });
    describe('POST /auth/login', () => {
        it('should return a valid JWT', done => {
            chai.request(server)
                .post('/auth/signin')
                .set('Authorization', 'Basic Zmxvcmlhbi5zaGVuYUBnbWFpbC5jb206cGFzc3dvcmQ=')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object').that.has.property('token');
                    done();
                });
        });
        it('should return unauthorized response due to invalid credentials', done => {
            chai.request(server)
                .post('/auth/login')
                .set('Authorization', 'Basic Zmxvcmlhbi5zaGVuYUBnbWFpbC5jb206cGFzc3dmQ=')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.empty;
                    done();
                });
        });
    });
});
