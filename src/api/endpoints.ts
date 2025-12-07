export const ENDPOINTS = {
    // Users
    users: {
        getId: (id: string) => {return {url: `/users/${id}`, method: 'GET'}},
    },
    auth: {
        login: () => {return {url: `/auth/login`, method: 'POST'}},
        signup: () => {return {url: `/auth/register`, method: 'POST'}},
        refresh: () => {return {url: `/auth/refresh`, method: 'POST'}},
        verify: () => {return {url: `/auth/verify`, method: 'GET'}},
        logout: () => {return {url: `/auth/logout`, method: 'POST'}},
    },
    enterprise: {
        create: () => {return {url: `/enterprise`, method: 'POST'}},
        getAll: () => {return {url: `/enterprise`, method: 'GET'}},
        getActual: () => {return {url: `/enterprise/me`, method: 'GET'}},
        getById: (id: string) => {return {url: `/enterprise/${id}`, method: 'GET'}},
        updateEnterprise: (id: string) => {return {url: `/enterprise/${id}`, method: 'PATCH'}},
        softDelete: (id: string) => {return {url: `/enterprise/${id}`, method: 'DELETE'}},
    }
} as const;

export type EndpointKeys = keyof typeof ENDPOINTS;
