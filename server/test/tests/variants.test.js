var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("variants.test", () => {
    describe("GET /api/v2/variants/", () => {
        before(function () {
            db.run("INSERT into synonym_variants values (1, 'Big Apple', 1)");
        });

        it("createVariant: should create a new record", (done) => {
            let data = {
                synonym_id: 1,
                synonym_value: "New York City"
            }
            chai.request(app)
                .post('/api/v2/variants')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("getSingleVariant: should get a single record", (done) => {
            chai.request(app)
                .get('/api/v2/variants/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('synonym_variant_id').eql(1);
                    done();
                });
        });

        it("getSynonymsVariants: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/synonyms_variants/1,2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSynonymVariants: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/synonyms/1/variants')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("removeVariant: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/variants/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("removeSynonymVariants: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2//synonyms/2/variants')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        
    });
});