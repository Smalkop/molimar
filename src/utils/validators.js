export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} es requerido`;
  }
  return null;
}

export function validateLength(value, min, max, fieldName) {
  if (value && (value.length < min || value.length > max)) {
    return `${fieldName} debe tener entre ${min} y ${max} caracteres`;
  }
  return null;
}

export function validatePhone(phone) {
  return /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
}

export function sanitizeString(str) {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function validateProduct(data) {
  const errors = [];
  const nameErr = validateRequired(data.name, 'Nombre');
  if (nameErr) errors.push(nameErr);
  if (!data.product_type_id) errors.push('Tipo de producto es requerido');
  return errors;
}

export function validateContact(data) {
  const errors = [];
  const nameErr = validateRequired(data.name, 'Nombre');
  if (nameErr) errors.push(nameErr);
  if (!data.email || !validateEmail(data.email)) errors.push('Email inválido');
  const msgErr = validateRequired(data.message, 'Mensaje');
  if (msgErr) errors.push(msgErr);
  return errors;
}
