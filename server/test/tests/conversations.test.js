var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("conversations.test", () => {
    describe("GET /api/v2/conversations/", () => {
        before(function () {
            db.run("INSERT into conversations (bot_id) values (1)");
        });

        it("createConversation: should create a new record", (done) => {
            let data = {
                bot_id: 1
            }
            chai.request(app)
                .post('/api/v2/conversations')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getConversation: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/conversations/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("removeConversation: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/conversations?conversation_id=2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});