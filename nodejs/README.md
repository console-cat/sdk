# Node.js SDK

This is the Console Cat Node.js SDK.

*/ᐠﹷ ‸ ﹷ ᐟ\ﾉ* 
## First steps 

To start collecting CLI telemetry, go to the [Console Cat website](https://www.consolecat.dev/), sign in with your GitHub account, and click "Add a CLI".

You'll get a code snippet with your Console Cat **<CLI_ID>** that you can then drop into your Node.js CLI.
## Installation

Download the `@console-cat/sdk` package with your package manager of choice.

### Yarn
```
yarn add @console-cat/sdk
```

### npm
```
npm install @console-cat/sdk
```

## Initialize Console Cat

Once you've installed the SDK package and created a CLI on our website, all that's left is copy-and-pasting a snippet into your CLI's entry point to initialize Console Cat.

Importantly, this snippet should run before anything else in your CLI. Usually it goes in your `index.js` (or `index.ts` if using Typescript). Alternatively, add it to the files linked in `bin` in your `package.json`.

### Javascript
```js
const { ConsoleCat } = require('@console-cat/sdk');
  
ConsoleCat.initialize({
    cliId: "<CLI_ID>",
    version: "<VERSION>", // Should match `version` in your CLI's `package.json`
});
```

### Typescript
```ts
import { ConsoleCat } from '@console-cat/sdk';
  
ConsoleCat.initialize({
    cliId: "<CLI_ID>",
    version: "<VERSION>", // Should match \`version\` in your CLI's `package.json`
});
```
## FAQ

### Q: What information does Console Cat collect?

A: Currently, Console Cat collects the timestamp, version, duration, exit code, and hash of machine UUID / GUID for every command execution. [Here's the code pointer.](https://github.com/console-cat/sdk/blob/master/nodejs/src/index.ts#L8-L22)

### Q: I don't see anything on my charts?!?

A: This means Console Cat hasn't recieved any telemetry from your CLI. After copy-and-pasting the Console Cat snippet, try running your CLI locally and then refresh the dashboard. 

Once it looks like it's working, you'll want to publish a new version of your CLI if using NPM.

If you're still having trouble, [reach out to the Console Cat team](meow@consolecat.dev) and we'll help you get set up.

### Q: Why is the version number wrong?


### Q: What about custom events?