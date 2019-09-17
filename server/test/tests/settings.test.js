var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("settings.test", () => {
    describe("GET /api/v2/settings/", () => {

        it("getSettings: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/settings')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getSetting: should get one records", (done) => {
            chai.request(app)
                .get('/api/v2/settings/refresh_time')
                .end((err, res) => {
                    console.log("body: " + res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        
        it("updateSetting: should update a record", (done) => {
            let data = {
                setting_value: "60000",
                setting_name: "refresh_time"
            }
            chai.request(app)
                .put('/api/v2/settings/refresh_time')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});