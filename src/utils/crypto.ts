import crypto from 'crypto';

const ALGORITHM_NAME = 'aes-128-gcm';
const ALGORITHM_NONCE_SIZE = 12;
const ALGORITHM_TAG_SIZE = 16;
const ALGORITHM_KEY_SIZE = 16;
const PBKDF2_NAME = 'sha256';
const PBKDF2_SALT_SIZE = 16;
const PBKDF2_ITERATIONS = 1000;

function encrypt(plaintext: any, key: any) {
  // Generate a 96-bit nonce using a CSPRNG.
  const nonce = crypto.randomBytes(ALGORITHM_NONCE_SIZE);

  // Create the cipher instance.
  const cipher = crypto.createCipheriv(ALGORITHM_NAME, key, nonce);

  // Encrypt and prepend nonce.
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()]);
}

export function encryptString(plaintext: string, password: string) {
  // Generate a 128-bit salt using a CSPRNG.
  const salt = crypto.randomBytes(PBKDF2_SALT_SIZE);

  // Derive a key using PBKDF2.
  const key = crypto.pbkdf2Sync(
    Buffer.from(password, 'utf8'),
    salt,
    PBKDF2_ITERATIONS,
    ALGORITHM_KEY_SIZE,
    PBKDF2_NAME,
  );

  // Encrypt and prepend salt.
  const ciphertextAndNonceAndSalt = Buffer.concat([salt, encrypt(Buffer.from(plaintext, 'utf8'), key)]);

  // Return as base64 string.
  return ciphertextAndNonceAndSalt.toString('base64');
}

function decrypt(ciphertextAndNonce: any, key: any) {
  // Create buffers of nonce, ciphertext and tag.
  const nonce = ciphertextAndNonce.slice(0, ALGORITHM_NONCE_SIZE);
  const ciphertext = ciphertextAndNonce.slice(ALGORITHM_NONCE_SIZE, ciphertextAndNonce.length - ALGORITHM_TAG_SIZE);
  const tag = ciphertextAndNonce.slice(ciphertext.length + ALGORITHM_NONCE_SIZE);

  // Create the cipher instance.
  const cipher = crypto.createDecipheriv(ALGORITHM_NAME, key, nonce);

  // Decrypt and return result.
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(ciphertext), cipher.final()]);
}

export function decryptString(base64CiphertextAndNonceAndSalt: any, password: any) {
  // Decode the base64.
  const ciphertextAndNonceAndSalt = Buffer.from(base64CiphertextAndNonceAndSalt, 'base64');

  // Create buffers of salt and ciphertextAndNonce.
  const salt = ciphertextAndNonceAndSalt.slice(0, PBKDF2_SALT_SIZE);
  const ciphertextAndNonce = ciphertextAndNonceAndSalt.slice(PBKDF2_SALT_SIZE);

  // Derive the key using PBKDF2.
  const key = crypto.pbkdf2Sync(
    Buffer.from(password, 'utf8'),
    salt,
    PBKDF2_ITERATIONS,
    ALGORITHM_KEY_SIZE,
    PBKDF2_NAME,
  );

  // Decrypt and return result.
  return decrypt(ciphertextAndNonce, key).toString('utf8');
}
