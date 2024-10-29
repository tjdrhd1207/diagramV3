import { FetchError } from "@/consts/erros";
import { ResponseHandler, messageFromError } from "../../global";

interface CreateUserRequest {
    userName: string;
    password: string;
}

export const createUserAccount = async (body: CreateUserRequest, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;
    try {
        const response = await fetch("/api/users?action=create", {
            method: "POST",
            cache: "no-cache",
            body: JSON.stringify(body)
        });

        const { status, statusText } = response;
        const contetntType = response.headers.get("Content-Type");
        if (contetntType?.includes("application/json")) {
            const json = await response.json();
            if (response.ok) {
                onOK();
            } else {
                const { code, message } = json;
                throw new FetchError(status, statusText, code, message);
            }
        } else {

        }
    } catch(error: any) {
        onError(messageFromError(error));
    }
}

export const getUserAccounts = async (handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch("/api/users");
        const { status, statusText } = response;
        const contetntType = response.headers.get("Content-Type");
        if (contetntType?.includes("application/json")) {
            const json = await response.json();
            if (response.ok) {
                onOK(json);
            } else {
                const { code, message } = json;
                throw new FetchError(status, statusText, code, message);
            }
        } else {

        }
    } catch (error: any) {

    }
}

interface UpdateUserRequest {
    enable?: boolean;
    password?: string;
    assginedRols?: string;
}

export const updateUserAccount = async (body: UpdateUserRequest, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;
}

export const deleteUserAccount = async (userName: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    if (userName) {

    } else {
        onError(`Invalid username "${userName}"`);
    }
}