# NAP Portal

NAP Portal allows you to create a web-interface to control your NAP application. It connects to the WebSocket server hosted by the application and generates a user interface in the browser.

Please refer to the [NAP Framework documentation](https://docs.nap-framework.tech) for a complete guide on how to set this up on the application side.

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

## Development

When making changes to NAP Portal itself, it's useful to have those changes automatically transpiled from TypeScript and loaded in [NAP Dashboard](https://github.com/napframework/nap-dashboard) or your own custom implementation. This way you can ensure everything works before creating a PR and going through the publishing workflow.

For this to work, you first need to set up a global symlink in this repository using:

```shell
# path/to/nap-portal
$ npm install typescript
$ npm link
```

Then, in another repository (like [NAP Dashboard](https://github.com/napframework/nap-dashboard)), you can use that symlink instead of the public package from NPM, using:

```shell
# e.g. path/to/nap-dashboard
$ npm link nap-portal
```

Any changes in the `/lib` folder will now be reflected in the project which is using the symlink instead of the public package. When you start making changes in `nap-portal`, you can start transpiling TypeScript automatically on change using:

```shell
# path/to/nap-portal
$ npm start
```

When you want to stop using the symlink in the other repository, you can remove the link using:

```shell
# e.g. path/to/nap-dashboard
$ npm unlink nap-portal --no-save
$ npm install
```

## Documentation

Documentation is built from comments in the codebase using [TypeDoc](https://typedoc.org/). Updates to the documentation are pushed to Git so they will be displayed in GitHub Pages. Documentation can be rebuilt using:

```shell
$ npm run docs
```

## Publishing

_Admin users only_

Before publishing, make sure to rebuild the documentation (see above) and commit the changes if any.

It's recommended to use `np` for publishing new versions, to ensure all steps are taken care of.
- Make sure `np` is installed globally
- Make sure you're autenticated with NPM
- Run `np` to select the new version number and publish

```shell
npm install --global np
npm login
np --no-2fa --no-release-draft
```
