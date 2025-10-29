import { Queue } from "bullmq";
import IORedis from "ioredis";
import { envs } from "src/config";

export const createSchedulerQueue = (connection: IORedis) => {
    const queue = new Queue('scheduler-events', { connection });
    return queue;
}