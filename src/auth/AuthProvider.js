import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, } from "firebase/auth";
import { auth } from "../lib/firebase";
// ---------- Context ----------
const AuthContext = createContext(undefined);
// ---------- Provider ----------
export const AuthProvider = ({ children, }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe; // cleanup listener
    }, []);
    // Auth actions
    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };
    const register = async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
    };
    const logout = async () => {
        await signOut(auth);
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, register, logout }, children: !loading && children }));
};
// ---------- Hook ----------
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
