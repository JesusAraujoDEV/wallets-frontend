import type { TFunction } from "i18next";

export function getReadableError(message: string, t: TFunction): string {
  const raw = message.toLowerCase();

  // Register / Login explicit controller messages
  if (raw.includes("username, email y password son requeridos")) return t("auth.errors.missingRegisterFields");
  if (raw.includes("usuario/email y contraseña requeridos")) return t("auth.errors.missingLoginCredentials");
  if (raw.includes("credenciales inválidas")) return t("auth.errors.invalidCredentials");
  if (raw.includes("el usuario o email ya existe")) return t("auth.errors.userExists");

  // Joi username
  if (raw.includes("username is required")) return t("auth.errors.usernameRequired");
  if (raw.includes("\"username\" length must be at least 3")) return t("auth.validation.usernameTooShort");
  if (raw.includes("\"username\" length must be less than or equal to 25")) return t("auth.errors.usernameTooLong");
  if (raw.includes("el username solo puede contener")) return t("auth.validation.usernameInvalidChars");

  // Joi name
  if (raw.includes("\"name\" length must be at least 3")) return t("auth.errors.nameTooShort");
  if (raw.includes("\"name\" length must be less than or equal to 120")) return t("auth.errors.nameTooLong");
  if (raw.includes("el nombre solo puede contener")) return t("auth.validation.nameInvalidChars");

  // Joi email
  if (raw.includes("email is required")) return t("auth.validation.emailRequired");
  if (raw.includes("\"email\" must be a valid email")) return t("auth.validation.invalidEmail");
  if (raw.includes("\"email\" length must be less than or equal to 160")) return t("auth.errors.emailTooLong");
  if (raw.includes("email inválido")) return t("auth.errors.emailInvalidGeneric");

  // Joi password
  if (raw.includes("password is required") || raw.includes("\"password\" is required")) return t("auth.validation.passwordRequired");
  if (raw.includes("\"password\" length must be at least 6")) return t("auth.errors.passwordTooShort");
  if (raw.includes("\"password\" length must be less than or equal to 200")) return t("auth.errors.passwordTooLong");

  // Joi xor username/email
  if (raw.includes("\"value\" must contain at least one of [username, email]")) return t("auth.validation.identifierRequired");
  if (raw.includes("\"value\" contains a conflict between exclusive peers [username, email]"))
    return t("auth.errors.identifierConflict");

  // Google login
  if (raw.includes("\"token\" length must be at least 10")) return t("auth.errors.googleTokenInvalidLength");
  if (raw.includes("el token de google es requerido")) return t("auth.errors.googleTokenRequired");
  if (raw.includes("el token de google no es válido")) return t("auth.errors.googleTokenInvalidOrExpired");
  if (raw.includes("el token de google no contiene email válido")) return t("auth.errors.googleTokenNoEmail");

  // Auth middleware
  if (raw.includes("token requerido")) return t("auth.errors.tokenRequired");
  if (raw.includes("token inválido")) return t("auth.errors.tokenInvalid");
  if (raw.includes("usuario no encontrado")) return t("auth.errors.userNotFound");

  // Generic http status hints
  if (raw.includes("401") || raw.includes("unauthorized")) return t("auth.errors.unauthorized");
  if (raw.includes("404") || raw.includes("not found")) return t("auth.errors.notFound");
  if (raw.includes("409") || raw.includes("conflict")) return t("auth.errors.userExists");

  return t("auth.errors.generic");
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
