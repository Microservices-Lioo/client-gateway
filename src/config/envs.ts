import 'dotenv/config';
import * as env from 'env-var';

interface EnvVars {
    PORT: number;
    CARD_MS_PORT: number;
    CARD_MS_HOST: string;
    ORDER_MS_PORT: number;
    ORDER_MS_HOST: string;
    AUTH_MS_PORT: number;
    AUTH_MS_HOST: string;   
    GAME_MS_PORT: number;
    GAME_MS_HOST: string; 
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRATION: string;
}

export const envs: EnvVars = {
    PORT: env.get('PORT').required().asPortNumber(),
    CARD_MS_PORT: env.get('CARD_MS_PORT').required().asPortNumber(),
    CARD_MS_HOST: env.get('CARD_MS_HOST').required().asString(),
    ORDER_MS_PORT: env.get('ORDER_MS_PORT').required().asPortNumber(),
    ORDER_MS_HOST: env.get('ORDER_MS_HOST').required().asString(),
    AUTH_MS_PORT: env.get('AUTH_MS_PORT').required().asPortNumber(),
    AUTH_MS_HOST: env.get('AUTH_MS_HOST').required().asString(),
    GAME_MS_PORT: env.get('GAME_MS_PORT').required().asPortNumber(),
    GAME_MS_HOST: env.get('GAME_MS_HOST').required().asString(),
    JWT_SECRET: env.get('JWT_SECRET').required().asString(),
    JWT_EXPIRATION: env.get('JWT_EXPIRATION').required().asString(),
    JWT_REFRESH_SECRET: env.get('JWT_REFRESH_SECRET').required().asString(),
    JWT_REFRESH_EXPIRATION: env.get('JWT_REFRESH_EXPIRATION').required().asString(),
}
