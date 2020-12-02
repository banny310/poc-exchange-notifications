import * as Redis from "ioredis";
import * as Redlock from "redlock";

export const redis = new Redis({
    port: 6380, // Redis port
    host: '127.0.0.1', // Redis host
    db: 0,
});

export const redlock = new Redlock([redis],
    {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // multiplied by lock ttl to determine drift time

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount: 500,

        // the time in ms between attempts
        retryDelay: 5, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 5 // time in ms
    }
);

export const removeSortedSet = async (key: string, redis: Redis.Redis) => {
    try {
        const newKey = 'gc:hashes:' + await redis.incr('gc:index');
        await redis.rename(key, newKey);
        while (await redis.zcard(newKey) > 0) {
            await redis.zremrangebyrank(newKey, 0, 99);
        }
    } catch (e) {
    }
};

export const random = (min: number, max: number) => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
