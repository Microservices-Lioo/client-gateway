import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    WS_PORT: number;
    FRONTEND_URL: string;
    NATS_SERVERS: string[];
    MAX_NUMBER_BINGO: number;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    WS_PORT: joi.number().required(),
    FRONTEND_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items( joi.string() ).required(),
    MAX_NUMBER_BINGO: joi.number().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate( {
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
} );

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs: EnvVars = {
    PORT: envVars.PORT,
    WS_PORT: envVars.WS_PORT,
    FRONTEND_URL: envVars.FRONTEND_URL,
    NATS_SERVERS: envVars.NATS_SERVERS,
    MAX_NUMBER_BINGO: envVars.MAX_NUMBER_BINGO,
}
