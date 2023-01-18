import { createContext, ReactNode, useEffect, useState } from "react";

import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";

export type AuthContextDataprops = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    isLoadingUserStorageData: boolean;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataprops>({} as AuthContextDataprops);

export function AuthContextProvider({ children }: AuthContextProviderProps) {

    const [user, setUser] = useState<UserDTO>({} as UserDTO);
    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    async function signIn(email: string, password: string) {
        try {
            const { data } = await api.post("/sessions", { email, password });
            if (data.user) {
                setUser(data.user);
                storageUserSave(data.user);
            }
        } catch (error) {
            throw error;
        }
    }

    async function signOut() {
        try {
            setIsLoadingUserStorageData(true);
            setUser({} as UserDTO);
            await storageUserRemove();
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function loadUserData() {
        try {
            const user = await storageUserGet();
            setUser(user);
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoadingUserStorageData }}>
            {children}
        </AuthContext.Provider>
    );
}