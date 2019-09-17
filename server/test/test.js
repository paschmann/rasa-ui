var common = require("./common");
const fs = require('fs');

function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

setTimeout(function () {
    db_file_path = "server/test/db/test_db.sqlite3";

    //Wait for test data to be inserted into DB
    describe("Rasa UI Server Tests", function () {
        importTest("Bots", './tests/bots.test');
        importTest("Intents", './tests/intents.test');
        importTest("Entity", './tests/entities.test');
        importTest("Regex", './tests/regex.test');
        importTest("Actions", './tests/actions.test');
        importTest("Conversations", './tests/conversations.test');
        importTest("Expressions", './tests/expressions.test');
        importTest("Models", './tests/models.test');
        importTest("Parameters", './tests/parameters.test');
        importTest("Responses", './tests/responses.test');
        importTest("Settings", './tests/settings.test');
        importTest("Stories", './tests/stories.test');
        importTest("Synonyms", './tests/synonyms.test');
        importTest("Variants", './tests/variants.test');
    });
    run();
}, 1000);