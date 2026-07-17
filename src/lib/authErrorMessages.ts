export function getReadableError(message: string): string {
  const raw = message.toLowerCase();

  // Register / Login explicit controller messages
  if (raw.includes("username, email y password son requeridos")) return "Completa usuario, correo y contraseña.";
  if (raw.includes("usuario/email y contraseña requeridos")) return "Escribe tu usuario o correo y tu contraseña.";
  if (raw.includes("credenciales inválidas")) return "Credenciales inválidas. Revisa usuario/correo y contraseña.";
  if (raw.includes("el usuario o email ya existe")) return "Ese usuario o correo ya está registrado.";

  // Joi username
  if (raw.includes("username is required")) return "Escribe tu nombre de usuario para continuar.";
  if (raw.includes("\"username\" length must be at least 3")) return "Tu usuario debe tener al menos 3 caracteres.";
  if (raw.includes("\"username\" length must be less than or equal to 25")) return "Tu usuario no puede superar 25 caracteres.";
  if (raw.includes("el username solo puede contener")) return "El usuario sólo puede tener letras, números, . _ o -";

  // Joi name
  if (raw.includes("\"name\" length must be at least 3")) return "Tu nombre debe tener al menos 3 caracteres.";
  if (raw.includes("\"name\" length must be less than or equal to 120")) return "Tu nombre no puede superar 120 caracteres.";
  if (raw.includes("el nombre solo puede contener")) return "El nombre sólo puede contener letras y espacios.";

  // Joi email
  if (raw.includes("email is required")) return "Escribe tu correo para continuar.";
  if (raw.includes("\"email\" must be a valid email")) return "Ese correo no parece válido. Revisa el @.";
  if (raw.includes("\"email\" length must be less than or equal to 160")) return "Tu correo no puede superar 160 caracteres.";
  if (raw.includes("email inválido")) return "Email inválido. Usa un formato válido sin caracteres especiales.";

  // Joi password
  if (raw.includes("password is required") || raw.includes("\"password\" is required")) return "Escribe tu contraseña para continuar.";
  if (raw.includes("\"password\" length must be at least 6")) return "La contraseña es muy corta (mínimo 6 caracteres).";
  if (raw.includes("\"password\" length must be less than or equal to 200")) return "La contraseña es demasiado larga (máximo 200).";

  // Joi xor username/email
  if (raw.includes("\"value\" must contain at least one of [username, email]")) return "Escribe tu usuario o correo para continuar.";
  if (raw.includes("\"value\" contains a conflict between exclusive peers [username, email]"))
    return "Ingresa sólo usuario o correo, no ambos.";

  // Google login
  if (raw.includes("\"token\" length must be at least 10")) return "El token de Google es inválido.";
  if (raw.includes("el token de google es requerido")) return "El token de Google es requerido.";
  if (raw.includes("el token de google no es válido")) return "El token de Google no es válido o expiró.";
  if (raw.includes("el token de google no contiene email válido")) return "Google no entregó un email válido.";

  // Auth middleware
  if (raw.includes("token requerido")) return "No autorizado: falta el token de acceso.";
  if (raw.includes("token inválido")) return "No autorizado: token inválido o expirado.";
  if (raw.includes("usuario no encontrado")) return "No autorizado: usuario no encontrado.";

  // Generic http status hints
  if (raw.includes("401") || raw.includes("unauthorized")) return "No autorizado. Verifica tu sesión.";
  if (raw.includes("404") || raw.includes("not found")) return "No encontramos una cuenta con esos datos.";
  if (raw.includes("409") || raw.includes("conflict")) return "Ese usuario o correo ya está registrado.";

  return "Ups, algo no salió bien. Intenta nuevamente.";
}

export function parseBackendMessage(err: any): string {
  const msg = err?.message || "";
  if (!msg) return "";
  try {
    const asJson = JSON.parse(msg);
    if (asJson?.message) return String(asJson.message);
  } catch {
    // ignore
  }
  return msg;
}
