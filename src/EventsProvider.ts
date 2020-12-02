import {Event} from "./Event";
import {random} from "./redis";
import {TabsProvider} from "./TabsProvider";

export class EventsProvider extends Array<Event> {

    private events: Event[] = [];

    constructor(private tabs: TabsProvider,
                private maxTabsPerEvent: number,
                private minTabsPerEvent: number) {
        super();
    }

    initQueue(numEvents: number) {
        for (let i = 0; i < numEvents; ++i) {
            const numTabsInEvent = random(
                Math.min(this.tabs.length - 1, this.minTabsPerEvent),
                Math.min(this.tabs.length - 1, this.maxTabsPerEvent));
            this.events.push(this.generateEvent(numTabsInEvent));
        }
    }

    generateEvent(numTabsInEvent: number): Event {
        const eventTabs = [];
        for (let i = 0; i < numTabsInEvent; ++i) {
            eventTabs.push(this.tabs[random(0, this.tabs.length - 1)])
        }

        return new Event(eventTabs);
    }

    mpop(num: number): Event[] {
        let el;
        const result = [];
        while ((el = this.events.pop()) !== undefined && result.length < num) {
            result.push(el);
        }

        return <Event[]>result;
    }
}
