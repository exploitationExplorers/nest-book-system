import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { RegisterUser } from "../pages/Register";
import type { UpdatePassword } from "../pages/UpdatePassword";
import { message } from "antd";

interface ErrorResponseData {
    statusCode: number;
    message: string;
}

const userServiceInstance = axios.create({
    baseURL: 'http://localhost:3001/',
    timeout: 3000
});

export async function login(username: string, password: string) {
    return await userServiceInstance.post('/user/login', {
        username, password
    });
}

export async function registerCaptcha(email: string) {
    return await userServiceInstance.get('/user/register-captcha', {
        params: {
            address: email
        }
    });
}

export async function register(registerUser: RegisterUser) {
    return await userServiceInstance.post('/user/register', registerUser);
}


export async function updatePasswordCaptcha(email: string) {
    return await userServiceInstance.get('/user/update_password/captcha', {
        params: {
            address: email
        }
    });
}

export async function updatePassword(data: UpdatePassword) {
    return await userServiceInstance.post('/user/update_password', data);
}

const examServiceInstance = axios.create({
    baseURL: 'http://localhost:3002/',
    timeout: 3000
});

const requestInterceptor = function(config: InternalAxiosRequestConfig) {
    const accessToken = localStorage.getItem('token');

    if(accessToken) {
        config.headers.authorization = 'Bearer ' + accessToken;
    }
    return config;
}

examServiceInstance.interceptors.request.use(requestInterceptor)

const responseIntercepor = (response: AxiosResponse) => {
    const newToken = response.headers['token'];
    if(newToken) {
        localStorage.setItem('token', newToken);
    }
    return response;
}

const responseErrorIntercepor = async (error: AxiosError) => {
    if(!error.response) {
        return Promise.reject(error);
    }
    const { data } = error.response as AxiosResponse<ErrorResponseData>;
    if (data.statusCode === 401) {
        message.error(data.message);

        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    } else {
        return Promise.reject(error);
    }
}

examServiceInstance.interceptors.response.use(
    responseIntercepor, 
    responseErrorIntercepor
)

export async function examList() {
    return await examServiceInstance.get('/exam/list');
}
