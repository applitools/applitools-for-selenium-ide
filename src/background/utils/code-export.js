// commands

export function emitCheckWindow(language, stepName) {
  switch (language) {
    case 'java-junit':
      if (stepName)
        return `eyes.check(Target.window().fully().beforeRenderHook(preRenderHook).withName("${stepName}"));`
      else
        return `eyes.check(Target.window().fully().beforeRenderHook(preRenderHook));`
    case 'javascript-mocha':
      if (stepName)
        return `await eyes.check("${stepName}", Target.window().webHook(preRenderHook).fully(true))`
      else
        return `await eyes.check((new URL(await driver.getCurrentUrl())).pathname, Target.window().webHook(preRenderHook).fully(true))`
    case 'python-pytest':
      if (stepName)
        return `self.eyes.check("${stepName}", Target.window().fully(True))`
      else
        return `self.eyes.check(urlparse(self.driver.current_url).path, Target.window().fully(True))`
    case 'ruby-rspec':
      if (stepName)
        return `@eyes.check("${stepName}", Applitools::Selenium::Target.window.fully.script_hook(@pre_render_hook))`
      else
        return `@eyes.check(URI.parse(@driver.current_url).path, Applitools::Selenium::Target.window.fully.script_hook(@pre_render_hook))`
    case ('csharp-nunit', 'csharp-xunit'):
      if (stepName)
        return `eyes.Check(Target.Window().Fully().WithName("${stepName}").BeforeRenderScreenshotHook(preRenderHook));`
      else
        return `eyes.Check(Target.Window().Fully().BeforeRenderScreenshotHook(preRenderHook));`
  }
}

export function emitCheckElement(language, locator, stepName) {
  switch (language) {
    case 'java-junit':
      if (stepName)
        return `eyes.check(Target.window().region(${locator}).beforeRenderHook(preRenderHook).withName("${stepName}"));`
      else
        return `eyes.check(Target.window().region(${locator}).beforeRenderHook(preRenderHook));`
    case 'javascript-mocha':
      if (stepName)
        return `await eyes.check("${stepName}", Target.region(${locator}).webHook(preRenderHook))`
      else
        return `await eyes.check((new URL(await driver.getCurrentUrl())).pathname, Target.region(${locator}).webHook(preRenderHook))`
    case 'python-pytest':
      if (stepName)
        return `self.eyes.check("${stepName}", Target.region([${locator}]))`
      else
        return `self.eyes.check(urlparse(self.driver.current_url).path, Target.region([${locator}]))`
    case 'ruby-rspec':
      if (stepName)
        return `@eyes.check("${stepName}", Applitools::Selenium::Target.region(${locator}).script_hook(@pre_render_hook))`
      else
        return `@eyes.check(URI.parse(@driver.current_url).path, Applitools::Selenium::Target.region(${locator}).script_hook(@pre_render_hook))`
    case ('csharp-nunit', 'csharp-xunit'):
      if (stepName)
        return `eyes.Check(Target.Region(${locator}).WithName("${stepName}").BeforeRenderScreenshotHook(preRenderHook));`
      else
        return `eyes.Check(Target.Region(${locator}).BeforeRenderScreenshotHook(preRenderHook));`
  }
}

export function emitSetMatchLevel(language, level) {
  switch (language) {
    case 'java-junit':
      return `eyes.setMatchLevel("${level}");`
    case 'javascript-mocha':
      return `await eyes.setMatchLevel("${level}");`
    case 'python-pytest':
      return `self.eyes.match_level("${level}")`
    case 'ruby-rspec':
      return `@eyes.match_level("${level}")`
    case ('csharp-nunit', 'csharp-xunit'):
      return '' // TODO -- needs to be set in beforeEach config object
  }
}

export function emitSetMatchTimeout(language, timeout) {
  switch (language) {
    case 'java-junit':
      return `eyes.setMatchTimeout(${timeout});`
    case 'javascript-mocha':
      return `eyes.setMatchTimeout(${timeout})`
    case 'python-pytest':
      return `self.eyes.match_timeout(${timeout})`
    case 'ruby-rspec':
      return `@eyes.match_timeout(${timeout})`
    case ('csharp-nunit', 'csharp-xunit'):
      return '' // TODO -- needs to be set in beforeEach config object
  }
}

export function emitSetPreRenderHook(
  language,
  jsSnippet,
  { isVisualGridEnabled } = {}
) {
  switch (language) {
    case 'java-junit':
      if (isVisualGridEnabled) return `preRenderHook = "${jsSnippet}";`
      else return `preRenderHook = "";`
    case 'javascript-mocha':
      if (isVisualGridEnabled) return `preRenderHook = "${jsSnippet}"`
      else return `preRenderHook = ""`
    case 'python-pytest':
      // not implemented in the SDK yet
      return ''
    case 'ruby-rspec':
      if (isVisualGridEnabled) return `preRenderHook = '${jsSnippet}'`
      else return `preRenderHook = ''`
    case ('csharp-nunit', 'csharp-xunit'):
      if (isVisualGridEnabled) return `preRenderHook = "${jsSnippet}";`
      else return ''
  }
}

export function emitSetViewportSize(language, width, height) {
  switch (language) {
    case 'java-junit':
      return `Eyes.setViewportSize(driver, new RectangleSize(${width}, ${height}));`
    case 'javascript-mocha':
      return `await eyes.setViewportSize({ width: ${width}, height: ${height} })`
    case 'python-pytest':
      return `self.eyes.viewport_size = {'width': ${width}, 'height': ${height}}`
    case 'ruby-rspec':
      return '' // handled in beforeEach
    case ('csharp-nunit', 'csharp-xunit'):
      return '' // handled in beforeEach
  }
}

// hooks
export function emitAfterEach(language, { isVisualGridEnabled } = {}) {
  let result = ''
  switch (language) {
    case 'java-junit':
      if (isVisualGridEnabled) result += `runner.getAllTestResults();\n`
      result += `eyes.abortIfNotClosed();`
      break
    case 'javascript-mocha':
      if (isVisualGridEnabled) {
        result += `const results = await eyes.getRunner().getAllTestResults()\n`
        result += `console.log(results)\n`
      }
      result += `eyes.abortIfNotClosed()`
      break
    case 'python-pytest':
      if (isVisualGridEnabled) result += `self.vg_runner.get_all_test_results()`
      else result += `self.eyes.abort_if_not_closed()`
      break
    case 'ruby-rspec':
      if (isVisualGridEnabled)
        result += `@visual_grid_runner.get_all_test_results`
      else result += `@eyes.abort_if_not_closed`
      break
    case ('csharp-nunit', 'csharp-xunit'):
      if (isVisualGridEnabled) {
        result += `eyes.CloseAsync();`
      } else {
        result += `eyes.AbortIfNotClosed();`
      }
      result += `\nTestResultsSummary allTestResults = runner.GetAllTestResults();`
      result += `\nSystem.Console.WriteLine(allTestResults);`
      break
  }
  return result
}

function emitVisualGridOptions(
  visualGridOptions,
  { deviceEmitter, browserEmitter } = {}
) {
  let result = ''
  visualGridOptions.forEach(browser => {
    if (browser.deviceName)
      result += deviceEmitter(
        browser.deviceId,
        browser.screenOrientation.toUpperCase()
      )
    else {
      browser.type = browser.id
        ? browser.id.toUpperCase()
        : browser.name.toUpperCase()
      result += browserEmitter(browser)
    }
  })
  return result
}

export function emitBeforeEach(
  language,
  projectName,
  testName,
  { baselineEnvName, viewportSize, visualGridOptions } = {}
) {
  let result = ''
  switch (language) {
    case 'java-junit':
      if (visualGridOptions) {
        result += `runner = new VisualGridRunner(concurrency);\neyes = new Eyes(runner);\n`
        result += `Configuration config = eyes.getConfiguration();`
        const deviceEmitter = (deviceId, orientation) => {
          return `\nconfig.addDeviceEmulation(DeviceName.${deviceId}, ScreenOrientation.${orientation});`
        }
        const browserEmitter = browser => {
          return `\nconfig.addBrowser(${browser.width}, ${browser.height}, BrowserType.${browser.type});`
        }
        result += emitVisualGridOptions(visualGridOptions, {
          deviceEmitter,
          browserEmitter,
        })
        result += `\neyes.setConfiguration(config);`
      } else {
        result += `eyes = new Eyes();`
        result += `\neyes.setApiKey(System.getenv("APPLITOOLS_API_KEY"));`
        if (baselineEnvName)
          result += `\neyes.setBaseLineEnvName("${baselineEnvName}");`
      }
      result += `\neyes.open(driver, "${projectName}", "${testName}");`
      break
    case 'javascript-mocha':
      if (visualGridOptions) {
        result += `eyes = new Eyes(new VisualGridRunner())\n`
        result += `const config = new Configuration()\n`
        result += 'config.setConcurrentSessions(10)'
        const deviceEmitter = (deviceId, orientation) => {
          return `\nconfig.addDeviceEmulation(DeviceName.${deviceId}, ScreenOrientation.${orientation})`
        }
        const browserEmitter = browser => {
          return `\nconfig.addBrowser(${browser.width}, ${browser.height}, BrowserType.${browser.type})`
        }
        result += emitVisualGridOptions(visualGridOptions, {
          deviceEmitter,
          browserEmitter,
        })
        result += `\neyes.setConfiguration(config)`
      } else {
        result += `eyes = new Eyes()`
      }
      result += `\neyes.setApiKey(process.env["APPLITOOLS_API_KEY"])`
      if (baselineEnvName)
        result += `\neyes.setBaselineEnvName("${baselineEnvName}")`
      result += `\nawait eyes.open(driver, "${projectName}", "${testName}")`
      break
    case 'python-pytest':
      if (visualGridOptions) {
        result += `concurrency = 10\n`
        result += `self.vg_runner = VisualGridRunner(concurrency)\n`
        result += `self.eyes = Eyes(self.vg_runner)\n`
        result += `config = Configuration()`
        const deviceEmitter = (deviceId, orientation) => {
          return `\nconfig.add_device_emulation(DeviceName.${deviceId}, ScreenOrientation.${orientation})`
        }
        const browserEmitter = browser => {
          return `\nconfig.add_browser(${browser.width}, ${browser.height}, BrowserType.${browser.type})`
        }
        result += emitVisualGridOptions(visualGridOptions, {
          deviceEmitter,
          browserEmitter,
        })
        result += `\nself.eyes.configuration = config`
      } else {
        result += `self.eyes = Eyes()`
      }
      result += `\nself.eyes.api_key = os.environ["APPLITOOLS_API_KEY"]`
      if (baselineEnvName)
        result += `\neyes.baseline_env_name = "${baselineEnvName}"`
      result += `\nself.eyes.open(self.driver, "${projectName}", "${testName}")`
      break
    case 'ruby-rspec':
      viewportSize = viewportSize ? viewportSize : '1024x768'
      if (visualGridOptions) {
        result += `@visual_grid_runner = Applitools::Selenium::VisualGridRunner.new(10)\n`
        result += `@eyes = Applitools::Selenium::Eyes.new(visual_grid_runner: @visual_grid_runner)\n`
        result += `config = Applitools::Selenium::Configuration.new.tap do |c|\n`
        result += `  c.api_key = ENV['APPLITOOLS_API_KEY']\n`
        result += `  c.app_name = '${projectName}'\n`
        result += `  c.test_name = '${testName}'\n`
        result += `  c.viewport_size = Applitools::RectangleSize.for('${viewportSize}')`
        if (baselineEnvName)
          result += `\n  c.baseline_env_name = '${baselineEnvName}'`
        const deviceEmitter = (deviceId, orientation) => {
          const deviceName = deviceId.replace(/_/g, '')
          return `\n  c.add_device_emulation(Devices::${deviceName
            .charAt(0)
            .toUpperCase() +
            deviceName.substring(1)}, Orientations::${orientation})`
        }
        const browserEmitter = browser => {
          return `\n  c.add_browser(${browser.width}, ${browser.height}, BrowserTypes::${browser.type})`
        }
        result += emitVisualGridOptions(visualGridOptions, {
          deviceEmitter,
          browserEmitter,
        })
        result += `\nend`
        result += `\n@eyes.config = config`
        result += `\n@eyes.open(driver: @driver)`
      } else {
        result += `@eyes = Applitools::Selenium::Eyes.new`
        result += `\n@eyes.api_key = ENV['APPLITOOLS_API_KEY']`
        if (baselineEnvName)
          result += `\n@eyes.baseline_env_name = '${baselineEnvName}'`
        result += `\n@eyes.open(driver: @driver, app_name: '${projectName}', test_name: '${testName}', viewport_size: '${viewportSize}')`
      }
      break
    case ('csharp-nunit', 'csharp-xunit'):
      // TODO: in both w/ & w/o VG
      // - set baselineEnvName
      // - set matchLevel
      viewportSize = viewportSize ? viewportSize.split('x') : ['1024', '768']
      if (visualGridOptions) {
        result += `runner = new VisualGridRunner(10);`
        result += `\neyes = new Eyes(runner);`
        result += `\nConfiguration conf = new Configuration();`
        result += `\nconf.SetTestName("${testName}");`
        result += `\nconf.SetAppName("${projectName}");`
        if (baselineEnvName)
          result += `\nconf.setBaselineEnvName("${baselineEnvName}");`
        const deviceEmitter = (deviceId, orientation) => {
          return `\nconf.AddDeviceEmulation(DeviceName.${deviceId}, ScreenOrientation.${orientation});`
        }
        const browserEmitter = browser => {
          return `\nconf.AddBrowser(${browser.width}, ${browser.height}, BrowserType.${browser.type});`
        }
        result += emitVisualGridOptions(visualGridOptions, {
          deviceEmitter,
          browserEmitter,
        })
        result += `\neyes.SetConfiguration(conf);`
        result += `\neyes.Open(driver);`
      } else {
        result += `eyes = new Eyes();`
        result += `\neyes.Open(driver, "${projectName}", "${testName}", new Size(${
          viewportSize[0]
        }, ${viewportSize[1]}));`
      }
      break
  }
  return result
}

export function emitDependency(language, { isVisualGridEnabled } = {}) {
  let result = ''
  switch (language) {
    case 'java-junit':
      result += `import com.applitools.eyes.selenium.Eyes;`
      result += `\nimport com.applitools.eyes.RectangleSize;`
      if (isVisualGridEnabled) {
        result += `\nimport com.applitools.eyes.selenium.BrowserType;`
        result += `\nimport com.applitools.eyes.selenium.Configuration;`
        result += `\nimport com.applitools.eyes.visualgrid.model.DeviceName;`
        result += `\nimport com.applitools.eyes.visualgrid.model.ScreenOrientation;`
        result += `\nimport com.applitools.eyes.visualgrid.services.VisualGridRunner;`
        result += `\nimport com.applitools.eyes.selenium.fluent.Target;`
      }
      break
    case 'javascript-mocha':
      result += `const { Eyes, Target } = require('@applitools/eyes-selenium')`
      if (isVisualGridEnabled)
        result += `\nconst { Configuration, VisualGridRunner, BrowserType, DeviceName, ScreenOrientation } = require('@applitools/eyes-selenium')`
      break
    case 'python-pytest':
      result += `import os\n`
      result += `from urllib.parse import urlparse\n`
      result += `from applitools.selenium import (Eyes, Target)\n`
      if (isVisualGridEnabled) {
        result += `from applitools.selenium import (Configuration, BrowserType, DeviceName, ScreenOrientation)\n`
        result += `from applitools.selenium.visual_grid import VisualGridRunner\n`
      }
      break
    case 'ruby-rspec':
      result += `require 'eyes_selenium'`
      break
    case ('csharp-nunit', 'csharp-xunit'):
      result += `using Applitools;\n`
      result += `using Applitools.Selenium;\n`
      result += `using Applitools.VisualGrid;\n`
      result += `using System.Drawing;\n`
      result += `using Configuration = Applitools.Selenium.Configuration;\n`
      result += `using ScreenOrientation = Applitools.VisualGrid.ScreenOrientation;`
      break
  }
  return result
}

export function emitInEachEnd(language, { isVisualGridEnabled } = {}) {
  switch (language) {
    case 'java-junit':
      if (isVisualGridEnabled) return undefined
      else return `eyes.close();`
    case 'javascript-mocha':
      if (isVisualGridEnabled) return undefined
      else return `await eyes.close()`
    case 'python-pytest':
      if (isVisualGridEnabled) return `self.eyes.close_async()`
      else return `self.eyes.close()`
    case 'ruby-rspec':
      return `@eyes.close(false)`
    case ('csharp-nunit', 'csharp-xunit'):
      if (isVisualGridEnabled) return undefined
      else return `eyes.CloseAsync();`
  }
}

export function emitVariable(language, { isVisualGridEnabled } = {}) {
  let result
  switch (language) {
    case 'java-junit':
      result = `private Eyes eyes;` // eslint-disable-line
      if (isVisualGridEnabled) {
        result += `\nprivate VisualGridRunner runner;\n`
        result += `final int concurrency = 5;\n`
        result += `private String preRenderHook;`
      }
      return result
    case 'javascript-mocha':
      return `let eyes\nlet preRenderHook`
    case ('python-pytest', 'ruby-rspec'):
      return undefined
    case ('csharp-nunit', 'csharp-xunit'):
      result = `Eyes eyes;`
      result += `\nstring preRenderHook;`
      if (isVisualGridEnabled) result += `\nVisualGridRunner runner;`
      return result
  }
}
