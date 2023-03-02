import { createContext, ReactNode, useEffect, useState } from "react";

import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";
import { storageAuthTokenRemove, storageAuthTokenSave, storageAuthTokenSaveGet } from "@storage/storageAuthToken";

export type AuthContextDataprops = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    isLoadingUserStorageData: boolean;
    updateUserProfle: (userUpdated: UserDTO) => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataprops>({} as AuthContextDataprops);

export function AuthContextProvider({ children }: AuthContextProviderProps) {

    const [user, setUser] = useState<UserDTO>({} as UserDTO);
    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

    async function userAndTokenUpdate(userData: UserDTO, token: string) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    }

    async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string) {
        await storageUserSave(userData);
        await storageAuthTokenSave({ token, refresh_token });
    }

    async function signIn(email: string, password: string) {
        try {
            const { data } = await api.post("/sessions", { email, password });
            if (data.user && data.token && data.refresh_token) {
                setIsLoadingUserStorageData(true);

                await storageUserAndTokenSave(data.user, data.token, data.refresh_token);
                userAndTokenUpdate(data.user, data.token);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function signOut() {
        try {
            setIsLoadingUserStorageData(true);
            setUser({} as UserDTO);
            await storageUserRemove();
            await storageAuthTokenRemove();
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function loadUserData() {
        try {

            setIsLoadingUserStorageData(true);

            const userLogged = await storageUserGet();
            const { token } = await storageAuthTokenSaveGet();

            if (userLogged && token) {
                userAndTokenUpdate(userLogged, token);
            }
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function updateUserProfle(userUpdated: UserDTO) {
        setUser(userUpdated);
        await storageUserSave(userUpdated);
    }

    useEffect(() => {
        loadUserData();
    }, []);

    // Passa a função de signOut para o axios
    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager(signOut);

        return () => subscribe();
    }, [signOut]);

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoadingUserStorageData, updateUserProfle }}>
            {children}
        </AuthContext.Provider>
    );
}