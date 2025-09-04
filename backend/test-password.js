const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPassword() {
  try {
    console.log('Testing password verification...');

    // Get the user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'constructbms@gmail.com')
      .single();

    if (error) {
      console.error('Error getting user:', error);
      return;
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash: user.password_hash,
    });

    // Test password verification
    const testPassword = 'ConstructBMS25';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);

    console.log('Password verification result:', isValid);

    // Also test with the hash we used in the seed data
    const expectedHash =
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqK8i';
    const isValidExpected = await bcrypt.compare(testPassword, expectedHash);

    console.log('Expected hash verification result:', isValidExpected);

    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log('New hash for same password:', newHash);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPassword();
