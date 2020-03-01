# Applitools Selenium IDE plugin &middot; [![Build Status](https://travis-ci.com/applitools/applitools-for-selenium-ide.svg?token=QdqsevXuKPcBpNJ7ADxQ&branch=master)](https://travis-ci.com/applitools/applitools-for-selenium-ide)

## Building The Project

```sh
yarn
yarn build:prod
```

For faster development builds use `yarn build -w`

To build for a development version of Selenium IDE use
```
env SIDE_IDE="extension-id" yarn build
```

The temporary SIDE extension ID used in local development can be found in your browser extension page after loading the IDE extension.

## Getting Started

After installing the plugin you will have a new icon in your navigation bar which contains the Applitools Eyes logo.

Clicking it will show a window prompting you to open the IDE if it's not already open. Once the IDE is open, the Eyes extension window will prompt you for your Applitools API key which you can grab from <a href="https://eyesapi.applitools.com/app/test-results/" target="_blank">your Eyes Account page</a>.

After you've pasted in your API key click `Apply` and the window will say `Successfully connected with Selenium IDE`.

_NOTE: If you want to configure the extension's behavior or visit your Eyes test dashboard, click the links provided in the extension window. See [`Configuring The Extension`](#configuring-the-extension) for details._

## Available Commands

Once the extension is connected with your Applitools Eyes account, you can head over to Selenium IDE and start updating your tests with commands for visual testing. Here's a breakdown of what's available.

### Check Window

This sets a visual checkpoint on the entire window. It will scroll throughout the page and build a screenshot of it.

It takes an optional argument of a name to display in the test results. This goes in the `target` input field in the IDE. If a name is not provided the URL of the current page will be used as the name.

### Check Element

This sets a visual checkpoint on an element. Note that this command will not scroll the element into view. Also, the element has to fit inside of the viewport for this command to work.

Similar to `Check Window`, this command takes an optional argument of a name. If one is not provided the URL of the current page will be used.

### Set Viewport Size

This resizes the browser to match the viewport size (excluding window borders). Setting a viewport size is useful for ensuring consistent test results.

It takes a required argument of `WidthxHeight` (e.g. `1280x800`).

_NOTE: If this command is not used prior to performing a check command a warning message will appear in the test log output in the IDE encouraging its use._

### Set Match Timeout

This sets the match timeout for the subsequent visual check points. A higher timeout means more retries will be made. The default timeout is 2 seconds.

This takes a required argument of the new wait time (in milliseconds).

### Set Match Level

This sets the match level for the subsequent check points. The default is Strict.

This takes a required argument of the new match level to be used. The options are `Exact`, `Strict`, `Content`, and `Layout`.

## Configuring The Extension

There is additional behavior you have access to within the extension's settings window. To access it click the extension icon in your browser navigation pane and click `Open settings`.

There are three tabs available in the settings window - `Tests`, `Account`, an `Advanced`.

In the `Tests` tab you can:

- Toggle visual checkpoints
- Toggle automatically opening the test manager after a test runs
- Specify a branch or a parent branch (for more details on branching see <a href="http://support.applitools.com/customer/en/portal/articles/2142886-using-multiple-branches-" target="_blank">the Eyes branching documentation</a>)

In the `Account` tab you can change your API key and change the server URL (e.g., if you have an on-premise instance of Applitools Eyes running).

And in the `Advanced` tab you can specify an alternate IDE Extension ID.
