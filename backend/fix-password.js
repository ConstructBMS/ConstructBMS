const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPassword() {
  try {
    console.log('Fixing user password...');
    
    // Generate correct password hash
    const password = 'ConstructBMS25';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('New password hash:', hashedPassword);
    
    // Update the user's password hash
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('email', 'constructbms@gmail.com')
      .select();

    if (error) {
      console.error('Error updating password:', error);
      return;
    }

    console.log('Password updated successfully:', data);
    
    // Verify the new password works
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('New password verification result:', isValid);
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
}

fixPassword();
