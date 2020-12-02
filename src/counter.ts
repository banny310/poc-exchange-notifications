import {redis, redlock} from "./redis";
import {EventsProvider} from "./EventsProvider";
import {TabsProvider} from "./TabsProvider";

const numTabs = 500000;
const numEvents = 10000;
const minTabsPerEvent = 20;
const maxTabsPerEvent = 100;
const prefetchCount = 100;

console.log(`Generating ${numTabs} tabs...`);
const tabsProvider = new TabsProvider();
tabsProvider.initTabs(numTabs);

console.log(`Generating ${numEvents} events...`);
const eventsProvider = new EventsProvider(tabsProvider, maxTabsPerEvent, minTabsPerEvent);
eventsProvider.initQueue(numEvents);

console.log(`Success`);

(async () => {
    let iter = 0;
    let lastIter = 0;

    setInterval(() => {
        console.log(`Updated ${iter - lastIter} tabs`);
        lastIter = iter;
    }, 1000);

    console.log(`Updating counters...`);
    let events = [];
    while ((events = eventsProvider.mpop(prefetchCount)).length) {
        //console.log(`Processing event with ${ev.count()} tabs`);
        try {
            const lock = await redlock.acquire(`lock:counters`, 1000);
            const pipe = redis.pipeline();
            events.forEach(ev => ev.getTabs().forEach(
                (tab) => pipe.zincrby(`counter:counters`, 1, tab)
            ));
            await pipe.exec();
            await lock.unlock();
        } catch (e) {
            console.error(e);
        }

        events.forEach(ev => {
            iter += ev.count()
        });
    }
})();
