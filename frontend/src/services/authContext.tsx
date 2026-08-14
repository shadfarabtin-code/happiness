import React, { createContext, useContext, useState, useEffect } from "react";
import { setItem, getItem, deleteItem } from "@/services/storage";
import { getMe, setUnauthorizedHandler, UnauthorizedError } from "@/services/api";

export type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    company_name: string | null;
    is_verified: boolean;
};

type AuthContextType = {
    user: User | null | undefined;
    token: string | null;
    setAuth: (user: User | null | undefined, token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
     // undefined means loading, null means no user, User means logged in
    const [user, setUserState] = useState<User | null | undefined>(undefined);
    const [token, setTokenState] = useState<string | null>(null);

    // Function to get user from secure storage
    async function getUser() {
        let result = await getItem("user");
        if (result) return JSON.parse(result);
        else return null;
    }

    // Function to get token from secure storage
    async function getToken() {
        let result = await getItem("token");
        if (result) return JSON.parse(result);
        else return null;
    }

    // Function to update BOTH in-memory state AND persisted storage
    async function setAuth(user: User | null | undefined, token: string | null) {
        setUserState(user);
        setTokenState(token);
        if (user) await setItem("user", JSON.stringify(user));
        else await deleteItem("user"); // for logout
        if (user) await setItem("token", JSON.stringify(token));
        else await deleteItem("token"); // for logout
    }

    // Load persisted user & token on app start, and confirm the token is still valid with the backend
    useEffect(() => {
        async function loadAuth() {
            const [storedUser, storedToken] = await Promise.all([getUser(), getToken()]);

            if (!storedToken) {
                setUserState(null);
                setTokenState(null);
                return;
            }

            try {
                const freshUser: User = await getMe(storedToken);
                setUserState(freshUser);
                setTokenState(storedToken);
                await setItem("user", JSON.stringify(freshUser));
            } catch (err) {
                if (err instanceof UnauthorizedError) return; // the 401 handler below already logged us out
                // Some other failure (e.g. offline) — fall back to the cached session rather than logging out.
                console.error("Failed to validate session", err);
                setUserState(storedUser);
                setTokenState(storedToken);
            }
        }
        loadAuth();
    }, []);

    // If any backend request comes back 401 (expired/revoked session), drop the stale local auth state
    useEffect(() => {
        setUnauthorizedHandler(() => setAuth(null, null));
        return () => setUnauthorizedHandler(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};