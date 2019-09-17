var common = require("../common");
var chai = common.chai;
var app = common.app;
var db = common.db;

describe("stories.test", () => {
    describe("GET /api/v2/stories/", () => {
        before(function () {
            db.run("INSERT into stories (story_id, story_name, story, bot_id) values (1, 'Story 1', 'story text', 1)");
        });

        it("createStory: should create a new record", (done) => {
            let data = {
                story_name: "Story 2",
                story: "story",
                bot_id: 1
            }
            chai.request(app)
                .post('/api/v2/stories')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("searchStoryAttributes: search all records", (done) => {
            chai.request(app)
                .get('/api/v2/stories/1/search?search_text=story')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("getAllBotStories: should get all records", (done) => {
            chai.request(app)
                .get('/api/v2/stories/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it("updateStory: should update a record", (done) => {
            let data = {
                story: "Story 2 Updated",
                story_id: 2
            }
            chai.request(app)
                .put('/api/v2/stories')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });

        it("removSeStory: should delete a record", (done) => {
            chai.request(app)
                .delete('/api/v2/stories?story_id=2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    done();
                });
        });
    });
});