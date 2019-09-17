var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("regex.test", () => {
    describe("GET /api/v2/regex/", () => {
        before(function () {
            db.run("INSERT into regex values (1, 'Regex 1', '*.*', 1)");
        });

        it("createRegex: should create a new record", (done) => {
            let data = {
                bot_id: 1,
                regex_name: "Regex 2",
                regex_pattern: "*.?*"
            }
            chai.request(app)
                .post('/api/v2/regex')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getBotRegex: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/bot/1/regex')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSingleRegex: should get a single record", (done) => {
            chai.request(app)
                .get('/api/v2/regex/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('regex_id').eql(1);
                    done();
                });
        });

        it("updateRegex: should update a record", (done) => {
            let data = {
                regex_name: "Regex 2 Updated"
            }
            chai.request(app)
                .put('/api/v2/regex/2')
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
                .delete('/api/v2/regex/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});