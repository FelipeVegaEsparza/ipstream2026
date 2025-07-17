/**
 * Sanitiza texto copiado de páginas web para evitar errores de servidor
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Normalizar Unicode (descomponer y recomponer caracteres)
    .normalize('NFKC')
    
    // Reemplazar comillas curvas por comillas normales
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    
    // Reemplazar guiones largos por guiones normales
    .replace(/[—–]/g, '-')
    
    // Reemplazar espacios especiales por espacios normales
    .replace(/[\u00A0\u2000-\u200B\u2028\u2029]/g, ' ')
    
    // Eliminar caracteres de control invisibles (excepto \n, \r, \t)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    
    // Reemplazar múltiples espacios por uno solo
    .replace(/\s+/g, ' ')
    
    // Eliminar espacios al inicio y final
    .trim();
}

/**
 * Sanitiza un objeto completo, limpiando todos los campos de texto
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Valida que el texto no contenga caracteres problemáticos
 */
export function validateText(text: string): { isValid: boolean; error?: string } {
  if (!text) {
    return { isValid: true };
  }

  // Verificar longitud máxima razonable
  if (text.length > 50000) {
    return { 
      isValid: false, 
      error: 'El texto es demasiado largo (máximo 50,000 caracteres)' 
    };
  }

  // Verificar que no contenga caracteres de control problemáticos
  const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
  if (controlChars.test(text)) {
    return { 
      isValid: false, 
      error: 'El texto contiene caracteres no válidos' 
    };
  }

  return { isValid: true };
}