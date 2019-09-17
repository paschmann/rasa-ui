var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("parameters.test", () => {
    describe("GET /api/v2/parameters/", () => {
        before(function () {
            db.run("insert into expression_parameters(expression_id, parameter_start, parameter_end, parameter_value, intent_id) values (1, 2, 3, 'test', 1)");
        });

        it("createParameter: should create a new record", (done) => {
            let data = {
                expression_id: 1,
                parameter_start: 3,
                parameter_end: 5,
                parameter_value: "Values",
                intent_id: 1
            }
            chai.request(app)
                .post('/api/v2/parameters')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getIntentParameters: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/intent/1/parameters')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getExpressionParametersQuery: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/expression_parameters?expression_ids=1,2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getExpressionParameters: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/expresions/1/parameters')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("updateParameter: should update a record", (done) => {
            let data = {
                entity_id: 1,
                parameter_id: 1
            }
            chai.request(app)
                .put('/api/v2/parameters/1')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("removeExpressionParameter: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/parameters/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});