import * as crypto from "crypto";

export class TabsProvider extends Array<string> {
    initTabs(numTabs: number) {
        for (let i = 0; i < numTabs; ++i) {
            this.push(crypto.randomBytes(20).toString('hex'));
        }
    }
}
