import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbsi';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await User.deleteOne({ email: 'test_participant@caias.in' });
  await mongoose.disconnect();
});

describe('CBSI Authentication & User Model Tests', () => {
  test('User password hashes on save and compares correctly', async () => {
    await User.deleteOne({ email: 'test_participant@caias.in' });

    const user = await User.create({
      name: 'Test Student',
      email: 'test_participant@caias.in',
      password: 'SecurePassword123',
      role: 'participant',
      department: 'Computer Science',
      programme: 'BCA',
      semester: 'V',
      registerNumber: 'CAIAS2024001',
    });

    expect(user.toJSON().password).toBeUndefined(); // toJSON strips password
    expect(user.password.startsWith('$2')).toBe(true); // password is encrypted with bcrypt
    // Fetch with password to verify hashing
    const userWithPass = await User.findById(user._id).select('+password');
    expect(userWithPass.password).not.toBe('SecurePassword123');
    expect(userWithPass.password.startsWith('$2')).toBe(true);

    const match = await userWithPass.comparePassword('SecurePassword123');
    expect(match).toBe(true);

    const wrongMatch = await userWithPass.comparePassword('WrongPassword');
    expect(wrongMatch).toBe(false);
  });

  test('Prevents duplicate email registration', async () => {
    await expect(
      User.create({
        name: 'Duplicate Test',
        email: 'test_participant@caias.in',
        password: 'AnotherPassword',
      })
    ).rejects.toThrow();
  });
});
