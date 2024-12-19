import 'dotenv/config';
import * as env from 'env-var';

interface EnvVars {
    PORT: number;
    CARD_MS_PORT: number;
    CARD_MS_HOST: string;
}

export const envs: EnvVars = {
    PORT: env.get('PORT').required().asPortNumber(),
    CARD_MS_PORT: env.get('CARD_MS_PORT').required().asPortNumber(),
    CARD_MS_HOST: env.get('CARD_MS_HOST').required().asString()
,}
