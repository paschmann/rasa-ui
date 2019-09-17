var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("entities.test", () => {
    describe("GET /api/v2/entities/", () => {
        before(function () {
            db.run("INSERT into entities values (1, 'Entity 1', 'TEXT', 1)");
        });

        it("createEntity: should create a new record", (done) => {
            let data = {
                bot_id: 1,
                entity_name: "Entity 2",
                slot_data_type: "TEXT"
            }
            chai.request(app)
                .post('/api/v2/entities')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getAllEntities: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/entities/bot/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSingleEntity: should get a single record", (done) => {
            chai.request(app)
                .get('/api/v2/entities/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('entity_id').eql(1);
                    done();
                });
        });

        it("updateEntity: should update a record", (done) => {
            let data = {
                entity_name: "Entity 2 Updated"
            }
            chai.request(app)
                .put('/api/v2/entities/2')
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
                .delete('/api/v2/entities/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});