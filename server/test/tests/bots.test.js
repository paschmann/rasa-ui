var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("bots.test", () => {
    describe("GET /api/v2/bots/", () => {
        before(function () {
            db.run("INSERT into bots values (1, 'Test Bot 1', '{}', '/models')");
        });

        it("createBot: should create a new record", (done) => {
            let bot = {
                bot_name: "Test Bot 2",
                bot_config: "{}",
                bot_output_folder: "/models"
            }
            chai.request(app)
                .post('/api/v2/bots')
                .send(bot)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getAllBots: should get all bots records", (done) => {
            chai.request(app)
                .get('/api/v2/bots/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSingleBot: should get a single bot record", (done) => {
            chai.request(app)
                .get('/api/v2/bots/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('bot_id').eql(2);
                    done();
                });
        });

        it("updateBot: should update a record", (done) => {
            let bot = {
                bot_name: "Test Bot 2 Updated",
                bot_config: "{}",
                bot_output_folder: "/models"
            }
            chai.request(app)
                .put('/api/v2/bots/2')
                .send(bot)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("removeBot: should delete a single bot record", (done) => {
            chai.request(app)
                .delete('/api/v2/bots/3')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});