var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("responses.test", () => {
    describe("GET /api/v2/responses/", () => {
        before(function () {
            db.run("INSERT into responses values (1, 'Response 1', 1, 'TEXT')");
        });

        it("createResponse: should create a new record", (done) => {
            let data = {
                action_id: 1,
                response_text: "Response 2",
                response_type: "TEXT"
            }
            chai.request(app)
                .post('/api/v2/response')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("updateResponse: should update a record", (done) => {
            let data = {
                response_id: 2,
                response_name: "Response 2 Updated",
                response_type: "TEXT"
            }
            chai.request(app)
                .put('/api/v2/response')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });


        it("removeResponse: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/response')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});