# NAP Portal

NAP Portal allows you to create a web-interface to control your NAP application. It connects to the WebSocket server hosted by the appplcation and generates a user interface in the browser.

Please refer to the [NAP Framework documentation](https://www.napframework.com/doxygen/) for a complete guide on how to set this up on the application side.

For more information about usage of this library, have a look at the [API documentation](https://napframework.github.io/nap-portal/).

Note that usage of this package still requires you to setup your own front-end architecture. For a more complete implementation, have a look at [NAP Dashboard](https://github.com/napframework/nap-dashboard).

## Installation

Install the package from NPM:

```shell
$ npm install nap-portal --save
```

## Usage

The `nap-portal` package comes with full TypeScript support.

Import the required components from the package:

```javascript
import { NAPWebSocket, NAPPortal } from 'nap-portal';
```

First start a connection with the WebSocket server running in your NAP application. Make sure that the configuration you pass here is complete and matches with the setup on the application side.

```javascript
const napWebSocket = new NAPWebSocket({
  host: 'localhost',
  port: 2000,
  user: 'napuser',
  pass: 'letmein!',
  secure: false
});
```

Then you can render the web-interface for a NAP portal component in an HTML element of your website. Make sure that the `portalId` matches with a portal component ID in your NAP application.

```javascript
const napPortal = new NAPPortal({
  el: document.getElementById('my-portal'),
  portalId: 'MyPortalID',
  napWebSocket: napWebSocket,
});
```

You can create multiple portals simultaneously, or create your own pagination and render a portal per page. In order to free up resources, make sure to destroy the portal when it's no longer required:

```javascript
napPortal.destroy();
napPortal = null;
```

## Publishing

_Admin users only_

It's recommended to use `np` for publishing new versions, to ensure all steps are taken care of.
- Make sure `np` is installed globally
- Make sure you're autenticated with to NPM
- Run `np` to select the new version number and publish

```shell
npm install --global np
npm login
np --no-2fa
```
