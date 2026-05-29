import { useEffect, useMemo, useState } from "react";
import * as authApi from "./api/auth";
import { AuthContext } from "./authContext";
import type { User } from "./types/user";
 // replace with your user type if you have one


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.getCurrentUser();
        setUser(me);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);

    // adjust keys to backend payload
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);

    const me = await authApi.getCurrentUser();
    localStorage.setItem("user", JSON.stringify(me));
    setUser(me);
  };

  const logout = async () => {
    await authApi.logout(); // your current logout already redirects
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

