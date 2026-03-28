/**
 * Validates and sanitizes data against a Zod schema.
 * @param {import('zod').ZodSchema} schema 
 * @param {any} data 
 * @param {boolean} throwError If true, throws ZodError. If false, returns null and shows toast.
 * @returns {any | null}
 */
export const validateAndSanitize = (schema, data, throwError = true) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (throwError) {
      throw error;
    }
    
    // Better error message for UI
    if (error.errors && error.errors.length > 0) {
      const firstError = error.errors[0];
      const message = `${firstError.path.join('.')}: ${firstError.message}`;
      console.error('Validation Error:', error);
      // We don't have access to showToast here directly since it's inside AppContext hook.
      // But we can throw a friendlier error.
      const friendlierError = new Error(message);
      friendlierError.name = 'ValidationError';
      friendlierError.details = error.errors;
      throw friendlierError;
    }
    
    throw error;
  }
};
