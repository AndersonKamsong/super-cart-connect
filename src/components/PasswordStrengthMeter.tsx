import React from 'react';

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const calculateStrength = () => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length > 7) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const strength = calculateStrength();
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'][strength] || '';
  const strengthColor = [
    'bg-red-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ][strength] || 'bg-gray-200';

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= strength ? strengthColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs mt-1 text-gray-500">
          Password strength: <span className="font-medium">{strengthText}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;