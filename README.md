
# POC Exchange Notifications

# Build

```
./node_modules/.bin/tsc --pretty -p tsconfig.json
```

# Run

1. Start Redis and adjust settings in `./src/redis.ts`
2. In two consoles run counter and sender process

    Counter

    ```
    node ./dist/counter.js
    ```

    Sender

    ```
    node ./dist/sender.js
    ```
