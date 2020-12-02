
export class Event {
    constructor(private tabs: string[]) {
    }

    getTabs(): string[] {
        return this.tabs;
    }

    count(): number {
        return this.tabs.length;
    }
}
