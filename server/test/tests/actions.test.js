var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("actions.test", () => {
    describe("GET /api/v2/actions/", () => {
        before(function () {
            db.run("INSERT into actions values (1, 'Action 1', 1)");
        });

        it("createAction: should create a new record", (done) => {
            let data = {
                bot_id: 1,
                action_name: "Action 2"
            }
            chai.request(app)
                .post('/api/v2/actions')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getBotActionsAndResponses: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/actions?bot_id=1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("removeAction: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/actions?action_id=2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});