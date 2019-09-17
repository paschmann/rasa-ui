var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("models.test", () => {
    describe("GET /api/v2/models/", () => {
        before(function () {
            //model_name, comment, bot_id, server_path, local_path
            db.run("INSERT into models (model_id, model_name, comment, bot_id, server_path, local_path) values (1, 'Model 1', 'comment', 1, '/server/path', '/local/path')");
        });

        it("createModel: should create a new record", (done) => {
            let data = {
                bot_id: 1,
                model_name: "Model 2",
                comment: "Comment",
                server_path: "/server/path",
                file_name: "filename"
            }
            chai.request(app)
                .post('/api/v2/models')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getBotModels: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/models/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("removeAction: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/models?model_id=2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});