#!/usr/bin/env node

/**
 * Utility script to hash a password using bcrypt
 *
 * Usage:
 *   node server/util/hash-password.js <password>
 *
 * Or interactive mode:
 *   node server/util/hash-password.js
 *
 * The script will output a bcrypt hash that can be used as the admin_password
 * in your environment variables or package.json config.
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Password provided as command line argument
    const password = args[0];
    const hash = await hashPassword(password);
    console.log('\n✅ Password hashed successfully!\n');
    console.log('Hashed password:');
    console.log(hash);
    console.log('\nTo use this hash, set the environment variable:');
    console.log(`export admin_password="${hash}"`);
    console.log('\nOr update your package.json config section:');
    console.log(`"admin_password": "${hash}"`);
    console.log('\n⚠️  WARNING: Do not store this hash in version control if it contains your actual password!\n');
  } else {
    // Interactive mode
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter password to hash: ', async (password) => {
      if (!password || password.trim() === '') {
        console.error('Error: Password cannot be empty');
        rl.close();
        process.exit(1);
      }

      const hash = await hashPassword(password);
      console.log('\n✅ Password hashed successfully!\n');
      console.log('Hashed password:');
      console.log(hash);
      console.log('\nTo use this hash, set the environment variable:');
      console.log(`export admin_password="${hash}"`);
      console.log('\nOr update your package.json config section:');
      console.log(`"admin_password": "${hash}"`);
      console.log('\n⚠️  WARNING: Do not store this hash in version control if it contains your actual password!\n');

      rl.close();
    });
  }
}

main();
