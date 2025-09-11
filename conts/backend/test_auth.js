const bcrypt = require('bcryptjs');

const password = 'password123';
const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

console.log('Testing password comparison...');
console.log('Password:', password);
console.log('Hashed:', hashedPassword);

bcrypt.compare(password, hashedPassword, (err, result) => {
  if (err) {
    console.error('Error comparing password:', err);
  } else {
    console.log('Password match result:', result);
  }
  
  // 새로운 해시 생성해보기
  bcrypt.hash(password, 10, (err, newHash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      console.log('New hash:', newHash);
      
      bcrypt.compare(password, newHash, (err, result) => {
        if (err) {
          console.error('Error comparing with new hash:', err);
        } else {
          console.log('New hash match result:', result);
        }
      });
    }
  });
});