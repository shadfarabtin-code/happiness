import React, { createContext, useContext, useState, useEffect } from "react";
import { setItem, getItem, deleteItem } from "@/services/storage";

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

    // Function to update BOTH in-memory state AND persisted storage
    async function setAuth(user: User | null | undefined, token: string | null) {
        setUserState(user);
        setTokenState(token);
        if (user) await setItem("user", JSON.stringify(user));
        else await deleteItem("user"); // for logout
        if (user) await setItem("token", JSON.stringify(token));
        else await deleteItem("token"); // for logout
    }

    // Load persisted user on app start
    useEffect(() => {
        async function loadUser() {
            getUser().then((storedUser) => {
                setUserState(storedUser);
            });
        }
        loadUser();
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