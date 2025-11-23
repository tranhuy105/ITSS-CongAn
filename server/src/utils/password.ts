import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Validate password strength
 * Must contain at least 2 of: uppercase/lowercase letters, numbers, symbols (excluding " and ')
 */
export const validatePasswordStrength = (password: string): boolean => {
  let criteriaCount = 0;

  // Check for letters (uppercase or lowercase)
  if (/[a-zA-Z]/.test(password)) {
    criteriaCount++;
  }

  // Check for numbers
  if (/\d/.test(password)) {
    criteriaCount++;
  }

  // Check for symbols (excluding " and ')
  if (/[!@#$%^&*()_+\-=\[\]{};:,.<>?/\\|`~]/.test(password)) {
    criteriaCount++;
  }

  return criteriaCount >= 2;
};
