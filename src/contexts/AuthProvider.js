import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/AuthProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, } from "firebase/auth";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);
    const value = useMemo(() => ({
        user,
        loading,
        async login(email, password) {
            await signInWithEmailAndPassword(auth, email, password);
        },
        async signup(email, password) {
            await createUserWithEmailAndPassword(auth, email, password);
        },
        async logout() {
            await signOut(auth);
        },
        async loginWithGoogle() {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        },
    }), [user, loading]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used inside <AuthProvider />");
    return ctx;
}
