var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("synonyms.test", () => {
    describe("GET /api/v2/synonyms/", () => {
        before(function () {
            db.run("INSERT into synonyms (bot_id, synonym_reference, regex_pattern) values (1, 'NYC', '*.*')");
        });
        //req.body.bot_id, req.body.synonym_reference, req.body.regex_pattern
        it("createBotSynonym: should create a new record", (done) => {
            let bot = {
                bot_id: 1,
                synonym_reference: "NYC",
                regex_pattern: "*.?"
            }
            chai.request(app)
                .post('/api/v2/synonyms')
                .send(bot)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getBotSynonyms: should get all bot records", (done) => {
            chai.request(app)
                .get('/api/v2/bot/1/synonyms')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSingleSynonym: should get a record", (done) => {
            chai.request(app)
                .get('/api/v2/synonyms/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('synonym_id').eql(1);
                    done();
                });
        });

        it("removeSynonym: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/synonyms/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});