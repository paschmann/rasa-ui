1. SQL Injection Vulnerabilities (Multiple Files)
Several database queries concatenate user input directly into SQL: Files affected:
server/db/expressions.js:30
server/db/parameters.js:8
server/db/variants.js:30
server/db/actions.js:15
Fix: Use parameterized queries or validate input rigorously.
2. No Password Hashing
server/routes/auth.js:8 - Plain text password comparison
if (req.body.username === global.admin_username && req.body.password === global.admin_password)
Fix: Use bcrypt to hash passwords.
3. Missing Authentication Middleware
No routes are actually protected! JWT tokens are created but never verified on any endpoint.
4. Path Traversal Vulnerability
server/db/models.js:35 - User input passed directly to fs.unlink()
fs.unlink(req.query.local_path, (err) => {
Fix: Validate paths are within allowed directories.
5. Hardcoded Default Credentials
package.json:35-37
"admin_username": "admin",
"admin_password": "admin",
"jwtsecret": "mysecret"
🔧 Quick Wins (Small Improvements)
1. Fix Bug in actions.js
server/db/actions.js:15
// Current (WRONG):
actionIds.splice(",")
// Should be:
actionIds.join(",")
2. Fix JWT Scoping Bug
server/routes/auth.js:44
// Move token declaration outside try block
let token;
try {
  token = jwt.sign(tokenData, global.jwtsecret);
3. Add JWT Expiration
server/routes/auth.js:15,44
token = jwt.sign(tokenData, global.jwtsecret, { expiresIn: '24h' });
4. Upgrade Critical Dependencies
npm update express body-parser jsonwebtoken
npm install axios  # Replace deprecated 'request' package
npm uninstall request
5. Add Security Headers
npm install helmet
Then in server/server.js:
const helmet = require('helmet');
app.use(helmet());
6. Add Rate Limiting
npm install express-rate-limit
7. Improve Error Logging
Throughout database files, change generic errors to include details:
// Instead of:
logger.winston.error("Error inserting a new record");
// Use:
logger.winston.error("Error inserting record:", err);
8. Add Input Validation
npm install express-validator
9. Use Transactions for Related Deletes
server/db/synonyms.js:46-47
db.serialize(() => {
  db.run("BEGIN TRANSACTION");
  db.run("DELETE FROM synonym_variants WHERE synonym_id = ?", [id]);
  db.run("DELETE FROM synonyms WHERE synonym_id = ?", [id]);
  db.run("COMMIT");
});
10. Fix CORS Configuration
server/routes/rasa_router.js:41 - Currently allows all origins (*)
📦 Dependency Issues
The codebase uses severely outdated dependencies with known vulnerabilities:
request (DEPRECATED - replace with axios)
angular 1.7.2 (has XSS vulnerabilities - upgrade to 1.8.3+)
jquery 3.4.0 (XSS vulnerabilities - needs ≥3.5.0)
express 4.16.4 (multiple CVEs - needs ≥4.21.2)
🎯 Recommended Priority Order
Fix SQL injection vulnerabilities (1-2 hours)
Add authentication middleware (2-3 hours)
Fix path traversal vulnerability (30 mins)
Hash passwords with bcrypt (1 hour)
Fix the two JavaScript bugs (splice → join, token scoping) (15 mins)
Replace deprecated request package (1-2 hours)
Add helmet and rate limiting (30 mins)
Upgrade critical dependencies (1 hour + testing)
Would you like me to help implement any of these fixes? I can start with the quick wins or tackle the critical security issues first.