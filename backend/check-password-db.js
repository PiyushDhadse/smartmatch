// check-db-password.js
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://mjaguvxibvwoemxukcal.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI2NzI2NzIsImV4cCI6MTk4ODI0MjY3Mn0.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI2NzI2NzIsImV4cCI6MTk4ODI0MjY3Mn0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserPassword() {
  const testEmail = 'debug1768158321711@example.com'; // From your test
  
  console.log('🔍 Checking user in database...');
  console.log('Email:', testEmail);
  
  try {
    // Query the user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password, name')
      .eq('email', testEmail)
      .single();
    
    if (error) {
      console.error('❌ Error fetching user:', error.message);
      return;
    }
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('\n✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Password field length:', user.password ? user.password.length : 'NULL');
    console.log('- Password first 20 chars:', user.password ? user.password.substring(0, 20) + '...' : 'NULL');
    console.log('- Is password a bcrypt hash?', user.password ? user.password.startsWith('$2b$') : 'NO PASSWORD');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserPassword();