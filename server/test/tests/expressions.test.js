var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("expressions.test", () => {
    describe("GET /api/v2/expressions/", () => {
        before(function () {
            db.run("INSERT into expressions values (1, 1, 'Expression 1')");
        });

        it("createExpression: should create a new record", (done) => {
            let data = {
                intent_id: 1,
                expression_name: "Expression 2"
            }
            chai.request(app)
                .post('/api/v2/expressions')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getIntentExpressions: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/intents/1/expressions')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getIntentExpressionQuery: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/intent_expressions?intent_ids=1,2,3')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSingleExpression: should get a single record", (done) => {
            chai.request(app)
                .get('/api/v2/expressions/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('expression_id').eql(1);
                    done();
                });
        });

        it("updateExpression: should update a record", (done) => {
            let data = {
                expression_text: "Expression 2 Updated"
            }
            chai.request(app)
                .put('/api/v2/expressions/2')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("removeExpression: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/expressions/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});