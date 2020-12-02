import {delay, redis, redlock} from "./redis";

(async () => {
    setInterval(async () => {
        const count = await redis.zcount(`counter:counters`, 1, 'inf');
        console.log(`Items to process in set: ${count}`)
    }, 1000);

    while (1) {
        //console.log(`Fetching last updated tabs...`);
        try {
            const scheduledSends = [];
            const now = Math.floor(Date.now() / 1000);

            const lock = await redlock.acquire(`lock:counters`, 1000);
            const updatedTabs = await redis.zrangebyscore(`counter:counters`, 1, 'inf', 'LIMIT', 0, 10000);
            //console.log(`Found tabs: ${updatedTabs.length}`);

            if (updatedTabs.length > 0) {
                // get tabs last message sent time
                const lastSentTime = await redis.hmget(`sender:sent_at`, updatedTabs);
                const pipe = redis.pipeline();
                for (let i = 0; i < updatedTabs.length; ++i) {
                    const tab = updatedTabs[i];
                    const lastSent = parseInt(lastSentTime[i] || '0');
                    //console.log(tab, lastSent, now - lastSent >= 60);
                    if (now - lastSent >= 60) {
                        // Should be check for send conditionals and if able to send enqueued in some other queue
                        scheduledSends.push(tab);

                        // remove tab from set to start from 0 and keep it clean
                        pipe.zrem(`counter:counters`, tab);
                    }
                }
                await pipe.exec();
            }
            await lock.unlock();


            // TODO: dummy batch send send
            console.log(`Sending ${scheduledSends.length} tabs...`);
            const pipe = redis.pipeline();
            scheduledSends.forEach(tab => pipe.hset(`sender:sent_at`, tab, now));
            await pipe.exec();
            //await delay(scheduledSends.length);

            if (scheduledSends.length == 0) {
                console.log(`Pausing process...`);
                await delay(1000);
            }
        } catch (e) {
            console.error(e);
        }
    }
})();
