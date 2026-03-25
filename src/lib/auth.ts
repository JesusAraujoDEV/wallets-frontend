import { apiFetch, setToken, getToken } from "./http";
import { trackedApiFetch } from "./storage";
import type {
  AuthProfileResponse,
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  ConfirmNewEmailPayload,
  GenericSuccessResponse,
  RequestEmailChangePayload,
  UnlinkGooglePayload,
  UpdateProfilePayload,
  UpdateProfileResponse,
  VerifyOldEmailOtpPayload,
} from "./types";

export type { AuthProfileResponse, AuthSession, AuthUser } from "./types";

type AuthSessionResponse = {
  ok: boolean;
  token: string;
  user: AuthUser;
};

export const AuthApi = {
  async login(payload: { username?: string; email?: string; password: string }): Promise<AuthSession> {
    const out = await apiFetch<AuthSessionResponse>(
      `auth/login`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    if (out?.token) setToken(out.token);
    return { token: out.token, user: { ...out.user, id: String(out.user.id) } };
  },
  async register(payload: { username: string; password: string; name?: string; email?: string }): Promise<AuthSession> {
    const out = await apiFetch<AuthSessionResponse>(
      `auth/register`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    if (out?.token) setToken(out.token);
    return { token: out.token, user: { ...out.user, id: String(out.user.id) } };
  },
  async googleLogin(googleCredential: string): Promise<AuthSession> {
    const out = await apiFetch<AuthSessionResponse>(
      `auth/google-login`,
      {
        method: "POST",
        body: JSON.stringify({ token: googleCredential }),
      }
    );
    if (out?.token) setToken(out.token);
    return { token: out.token, user: { ...out.user, id: String(out.user.id) } };
  },
  async me(): Promise<AuthProfileResponse> {
    const out = await apiFetch<AuthProfileResponse>(`auth/me`, { method: "GET" });
    return { ...out, user: { ...out.user, id: String(out.user.id) } };
  },
  async updateProfile(data: UpdateProfilePayload): Promise<AuthUser> {
    const out = await apiFetch<UpdateProfileResponse>(`auth/me`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    if ("user" in out) {
      return { ...out.user, id: String(out.user.id) };
    }

    return { ...out, id: String(out.id) };
  },
  async logout(): Promise<void> {
    try {
      await apiFetch(`auth/logout`, { method: "POST" });
    } finally {
      // Always clear local token
      setToken(null);
    }
  },
  async forgotPassword(email: string): Promise<GenericSuccessResponse> {
    return trackedApiFetch<GenericSuccessResponse>(`auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async requestEmailChange(payload: RequestEmailChangePayload): Promise<void> {
    await apiFetch<unknown>(`auth/email-change/request`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async verifyOldEmailOtp(payload: VerifyOldEmailOtpPayload): Promise<void> {
    await apiFetch<unknown>(`auth/email-change/verify-old`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async confirmNewEmail(payload: ConfirmNewEmailPayload): Promise<void> {
    await apiFetch<unknown>(`auth/email-change/confirm`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async unlinkGoogle(payload: UnlinkGooglePayload): Promise<void> {
    await apiFetch<unknown>(`auth/unlink-google`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async changePassword(payload: ChangePasswordPayload): Promise<GenericSuccessResponse> {
    return apiFetch<GenericSuccessResponse>(`auth/change-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async resetPassword(token: string, newPassword: string): Promise<GenericSuccessResponse> {
    return apiFetch<GenericSuccessResponse>(`auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
  token(): string | null {
    return getToken();
  },
};
