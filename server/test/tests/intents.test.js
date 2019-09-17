var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("intents.test", () => {
    describe("GET /api/v2/intents/", () => {
        before(function () {
            db.run("INSERT into intents values (1, 'Intent 1', 1)");
        });

        it("createBotIntent: should create a new record", (done) => {
            let data = {
                bot_id: 1,
                intent_name: "Intent 2"
            }
            chai.request(app)
                .post('/api/v2/intents')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getBotIntents: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/bots/1/intents')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSingleIntent: should get a single record", (done) => {
            chai.request(app)
                .get('/api/v2/intents/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('intent_id').eql(1);
                    done();
                });
        });

        it("updateIntent: should update a record", (done) => {
            let data = {
                intent_name: "Intent 2 Updated"
            }
            chai.request(app)
                .put('/api/v2/intents/2')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("removeIntent: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/intents/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});