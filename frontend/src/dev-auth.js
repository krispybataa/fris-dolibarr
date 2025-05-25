/**
 * Development Authentication Helper
 * 
 * This script helps you set up development tokens for testing.
 * Run this in your browser console to set a development token.
 */

// Function to set a development token
function setDevToken(role = 'admin') {
  const token = `dev_${role}`;
  localStorage.setItem('token', token);
  console.log(`✅ Development token set: ${token}`);
  console.log('🔄 Refresh the page to apply the token');
}

// Available roles
console.log('=== DEVELOPMENT AUTH HELPER ===');
console.log('Run one of these commands to set a development token:');
console.log('setDevToken("admin")  - Set admin role token');
console.log('setDevToken("faculty") - Set faculty role token');
console.log('setDevToken("user")   - Set regular user token');
