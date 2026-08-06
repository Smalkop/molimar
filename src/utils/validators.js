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
  else {
    const lenErr = validateLength(String(data.name).trim(), 2, 100, 'Nombre');
    if (lenErr) errors.push(lenErr);
  }
  if (!data.email || !validateEmail(data.email)) errors.push('Email inválido');
  else {
    const lenErr = validateLength(String(data.email), 5, 200, 'Email');
    if (lenErr) errors.push(lenErr);
  }
  const msgErr = validateRequired(data.message, 'Mensaje');
  if (msgErr) errors.push(msgErr);
  else {
    const lenErr = validateLength(String(data.message).trim(), 2, 5000, 'Mensaje');
    if (lenErr) errors.push(lenErr);
  }
  if (data.phone && !validatePhone(String(data.phone))) errors.push('Teléfono inválido');
  return errors;
}
