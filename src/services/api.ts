import axios, { AxiosError, AxiosInstance } from "axios";

import { AppError } from "@utils/AppError";
import { storageAuthTokenSaveGet, storageAuthTokenSave } from "@storage/storageAuthToken";

type SignOut = () => void;

type PromiseType = {
    onSuccess: (token: string) => void,
    onFailure: (error: AxiosError) => void,
};

// Cria uma tipagem personalizada para o axios, recebendo a função de signOut
type APIInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const api = axios.create({
    baseURL: "http://192.168.18.5:3333"
}) as APIInstanceProps;

let isRefreshing = false;
let failedQueue: Array<PromiseType> = [];

api.registerInterceptTokenManager = signOut => {

    const interceptTokenManager = api.interceptors.response.use((response) => {
        return response;
    }, async (requestError) => {

        // Se for "não autorizada"
        if (requestError?.response?.status === 401) {

            // Se o token expirou ou está inválido
            if (requestError.response.data.message === "token.expired" ||
                requestError.response.data.message === "token.invalid") {

                const { refresh_token } = await storageAuthTokenSaveGet();
                if (!refresh_token) {
                    signOut();
                    return Promise.reject(requestError);
                }

                const originalRequest = requestError.config;

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            onSuccess: (token: string) => {
                                resolve(token);
                            },
                            onFailure: (error: AxiosError) => {
                                reject(error);
                            }
                        });
                    })
                        // Depois de armazenar a request na fila
                        .then(token => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            return api(originalRequest);
                        })
                        .catch(error => {
                            throw error;
                        });
                }

                isRefreshing = true;

                console.log("aqui 2")

                // Faz a primeira request que chegou esperar a atualização do token
                return new Promise(async (resolve, reject) => {
                    try {
                        const { data } = await api.post("/sessions/refresh-token", { refresh_token });

                        await storageAuthTokenSave({
                            token: data.token,
                            refresh_token: data.refresh_token
                        });

                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                        failedQueue.forEach(failedRequest => {
                            failedRequest.onSuccess(data.token);
                        });

                        console.log("TOKEN ATUALIZADO", data.token);

                        resolve(axios(originalRequest));
                    } catch (error: any) {

                        console.log("aqui 3", error)

                        failedQueue.forEach(failedRequest => {
                            failedRequest.onFailure(error);
                        });

                        signOut();
                        reject(error);
                    } finally {
                        isRefreshing = false;
                        failedQueue = [];
                    }

                });

            }
            // Se não for um erro 401 mas não for relacionado ao token, desloga o usuário
            signOut();
        }

        if (requestError.response && requestError.response.data) {
            return Promise.reject(new AppError(requestError.response.data.message));
        } else {
            return Promise.reject(requestError);
        }
    });

    return () => {
        api.interceptors.response.eject(interceptTokenManager);
    }
}

api.interceptors.request.use((config) => {
    // console.log("DADOS ENVIADOS", config.data);
    return config;
}, (error) => {
    return Promise.reject(error);
});


export { api };