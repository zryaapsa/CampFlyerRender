import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = async () => {
        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            const authUser = authData?.user || null;
            setUser(authUser);

            if (authUser) {
                const { data: profile, error } = await supabase.from("users").select("*").eq("user_id", authUser.id).single();

                if (error) {
                    console.error("Gagal ambil user profile:", error.message);
                    setUserData(null);
                } else {
                    setUserData(profile);
                }
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error("Error getting user:", error.message);
            setUser(null);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = session?.user || null;
            setUser(newUser);

            if (newUser) {
                supabase
                    .from("users")
                    .select("*")
                    .eq("user_id", newUser.id)
                    .single()
                    .then(({ data, error }) => {
                        if (!error) {
                            setUserData(data);
                        } else {
                            setUserData(null);
                        }
                    });
            } else {
                setUserData(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ user, userData, setUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
