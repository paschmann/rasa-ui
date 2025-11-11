# Security Improvements

This document describes the security enhancements that have been implemented in Rasa UI.

## Password Hashing with bcrypt

The authentication system now supports bcrypt password hashing for enhanced security.

### Key Features

1. **Bcrypt Password Hashing**: Admin passwords can now be stored as bcrypt hashes instead of plain text
2. **Backward Compatibility**: The system automatically detects whether a password is hashed or plain text
3. **JWT Expiration**: Authentication tokens now expire after 24 hours
4. **Fixed JWT Scoping Bug**: Resolved token variable scoping issue in client authentication

### Using Hashed Passwords

#### Option 1: Using Environment Variables (Recommended)

1. Generate a hash for your password:
```bash
node server/util/hash-password.js yourpassword
```

2. Set the environment variable:
```bash
export admin_password="$2b$10$..."  # Use the hash from step 1
export admin_username="admin"
npm start
```

#### Option 2: Using Docker

```bash
docker run -e admin_password="$2b$10$..." -e admin_username="admin" paschmann/rasa-ui:latest
```

#### Option 3: Interactive Mode

```bash
node server/util/hash-password.js
# Enter your password when prompted
```

### Security Warnings

⚠️ **Important Security Notes:**

1. **Do NOT commit hashed passwords to version control** if they contain your actual production passwords
2. **Change the default credentials immediately** - The default `admin/admin` is well-known
3. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, and symbols
4. **Change the JWT secret** - The default `mysecret` is extremely weak and should be changed:
   ```bash
   export jwtsecret="your-strong-random-secret-here"
   ```

### Backward Compatibility

The system maintains backward compatibility with plain text passwords:

- If `admin_password` is a bcrypt hash (starts with `$2b$`), it uses bcrypt verification
- If `admin_password` is plain text, it falls back to direct comparison (with a warning logged)

**Recommendation:** Migrate to hashed passwords as soon as possible. Plain text password support is maintained only for smooth migration.

## Additional Security Fixes

### SQL Injection Prevention

All database queries using comma-separated IDs now use parameterized queries:

- ✅ `server/db/expressions.js` - Fixed IN clause SQL injection
- ✅ `server/db/parameters.js` - Fixed IN clause SQL injection
- ✅ `server/db/variants.js` - Fixed IN clause SQL injection
- ✅ `server/db/actions.js` - Fixed IN clause SQL injection (also fixed splice bug)

### Input Validation

All endpoints accepting comma-separated IDs now validate that they contain only numeric values.

### JWT Token Improvements

- Tokens now include expiration time (24 hours)
- Fixed token scoping bug in `authenticateClient` function

### Authentication Middleware (✅ IMPLEMENTED)

All API routes are now protected with JWT token verification:

**Protected Routes**: All routes under `/api/v2/*` except:
- `/api/v2/auth` - Login endpoint (public)
- `/api/v2/authclient` - Client authentication endpoint (public)

**How to Use:**

1. **Login to get a token:**
```bash
curl -X POST http://localhost:5001/api/v2/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

Response:
```json
{
  "username": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

2. **Use the token to access protected routes:**
```bash
curl http://localhost:5001/api/v2/bots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Error Responses:**

- `401` - No token provided: `{"success":false,"message":"No authentication token provided."}`
- `401` - Invalid token: `{"success":false,"message":"Invalid authentication token."}`
- `401` - Expired token: `{"success":false,"message":"Authentication token has expired. Please login again."}`
- `401` - Wrong format: `{"success":false,"message":"Invalid authorization header format. Use: Bearer <token>"}`

**Frontend Integration:**

The AngularJS frontend automatically includes the JWT token in all API requests via the Authorization header (see [web/src/app/app.js](web/src/app/app.js)).

### Path Traversal Protection (✅ IMPLEMENTED)

The model file deletion endpoint now validates all file paths to prevent path traversal attacks:

**Security Measures:**
- All file paths are validated before deletion
- Paths must be within the designated `server/data/models/` directory
- URL-encoded path traversal attempts are decoded and blocked (e.g., `..%2f`)
- Null byte injection attempts are blocked
- Only regular files can be deleted (not directories)
- Detailed logging of path traversal attempts

**Protected Endpoint:** `DELETE /api/v2/models?model_id=X&local_path=Y`

**Example Attack Prevention:**
```bash
# Attacker attempts to delete /etc/passwd
DELETE /api/v2/models?local_path=../../../etc/passwd
# Response: "Model removed from database, but file could not be deleted: Access denied: Path is outside allowed directory"
```

**Implementation:** [server/db/models.js](server/db/models.js) - `validateFilePath()` function

## Future Security Improvements

The following security enhancements are recommended but not yet implemented:

1. ✅ ~~**Authentication Middleware**~~ - **COMPLETED**: JWT verification middleware now protects all API routes
2. ✅ ~~**Path Traversal Protection**~~ - **COMPLETED**: File deletion now validates paths are within allowed directory
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Security Headers**: Implement helmet.js for security headers
5. **Dependency Updates**: Upgrade outdated dependencies with known vulnerabilities
6. **HTTPS Enforcement**: Run server behind HTTPS reverse proxy

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly rather than creating a public issue.
