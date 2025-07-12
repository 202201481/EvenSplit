// Form validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const validateFormData = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (rule.validator && !rule.validator(value)) {
        errors[field] = rule.message;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const commonRules = {
  required: (message = 'This field is required') => ({
    validator: validateRequired,
    message
  }),
  email: (message = 'Please enter a valid email address') => ({
    validator: validateEmail,
    message
  }),
  password: (message = 'Password must be at least 6 characters') => ({
    validator: validatePassword,
    message
  }),
  amount: (message = 'Please enter a valid amount greater than 0') => ({
    validator: validateAmount,
    message
  })
};
