import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmhpxjnuugufecmizzve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaHB4am51dWd1ZmVjbWl6enZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Nzc4MTIsImV4cCI6MjA4OTU1MzgxMn0.cDVf0ZlVIWDOl5wcZG2cYd-caqCiTUjWbGv3ro7aP3M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const testEmail = 'benja+test' + Math.floor(Math.random()*100000) + '@gmail.com';
  console.log('Testing signup with', testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Password123!',
  });
  
  if (error) {
    console.log('Signup error:', error.message);
    return;
  }
  
  console.log('Signup successful. User ID:', data.user?.id);

  console.log('\nTesting verifyOtp with type: "email"');
  const res1 = await supabase.auth.verifyOtp({
    email: testEmail,
    token: '123456',
    type: 'email'
  });
  console.log('verifyOtp error (email):', res1.error?.message || 'Success?');

  console.log('\nTesting verifyOtp with type: "signup"');
  const res2 = await supabase.auth.verifyOtp({
    email: testEmail,
    token: '123456',
    type: 'signup'
  });
  console.log('verifyOtp error (signup):', res2.error?.message || 'Success?');
}

testAuth();
