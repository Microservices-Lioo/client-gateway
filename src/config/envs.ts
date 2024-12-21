import 'dotenv/config';
import * as env from 'env-var';

interface EnvVars {
    PORT: number;
    CARD_MS_PORT: number;
    CARD_MS_HOST: string;
    ORDER_MS_PORT: number;
    ORDER_MS_HOST: string;
}

export const envs: EnvVars = {
    PORT: env.get('PORT').required().asPortNumber(),
    CARD_MS_PORT: env.get('CARD_MS_PORT').required().asPortNumber(),
    CARD_MS_HOST: env.get('CARD_MS_HOST').required().asString(),
    ORDER_MS_PORT: env.get('ORDER_MS_PORT').required().asPortNumber(),
    ORDER_MS_HOST: env.get('ORDER_MS_HOST').required().asString()
,}
