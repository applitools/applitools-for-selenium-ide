// commands

export function emitCheckWindow(language, stepName) {
  switch (language) {
    case 'java-junit':
      if (stepName)
        return `eyes.check(Target.window().fully().beforeRenderHook(preRenderHook).withName("${stepName}"));`
      else
        return `eyes.check(Target.window().fully().beforeRenderHook(preRenderHook));`
  }
}

export function emitCheckElement(language, locator, stepName) {
  switch (language) {
    case 'java-junit':
      if (stepName)
        return `eyes.check(Target.window().region(${locator}).beforeRenderHook(preRenderHook).withName("${stepName}"));`
      else
        return `eyes.check(Target.window().region(${locator}).beforeRenderHook(preRenderHook));`
  }
}

export function emitSetMatchLevel(language, level) {
  switch (language) {
    case 'java-junit':
      return `eyes.setMatchLevel("${level}");`
  }
}

export function emitSetMatchTimeout(language, timeout) {
  switch (language) {
    case 'java-junit':
      return `eyes.setMatchTimeout(${timeout});`
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
  }
}

export function emitSetViewportSize(language, width, height) {
  switch (language) {
    case 'java-junit':
      return `Eyes.setViewportSize(driver, new RectangleSize(${width}, ${height}));`
  }
}

// hooks
export function emitAfterEach(language, { isVisualGridEnabled } = {}) {
  let result = ''
  switch (language) {
    case 'java-junit':
      if (isVisualGridEnabled) result += `runner.getAllTestResults();\n`
      result += `eyes.abortIfNotClosed();`
      return result
  }
}

export function emitBeforeEach(
  language,
  projectName,
  testName,
  { baselineEnvName, visualGridOptions } = {}
) {
  let result = ''
  switch (language) {
    case 'java-junit':
      if (visualGridOptions) {
        result += `runner = new VisualGridRunner(concurrency);\neyes = new Eyes(runner);\n`
        result += `Configuration config = eyes.getConfiguration();`
        visualGridOptions.forEach(browser => {
          if (browser.deviceName) {
            result += `\nconfig.addDeviceEmulation(DeviceName.${
              browser.deviceId
            }, ScreenOrientation.${browser.screenOrientation.toUpperCase()});`
          } else {
            const browserId = browser.id
              ? browser.id
              : browser.name.toUpperCase()
            result += `\nconfig.addBrowser(${browser.width}, ${browser.height}, BrowserType.${browserId});`
          }
        })
        result += `\neyes.setConfiguration(config);`
      } else {
        result += `eyes = new Eyes();`
        result += `\neyes.setApiKey(System.getenv("APPLITOOLS_API_KEY"));`
        if (baselineEnvName)
          result += `\neyes.setBaseLineEnvName("${baselineEnvName}");`
      }
      result += `\neyes.open(driver, "${projectName}", "${testName}");`
      return result
  }
}

export function emitDependency(language, { isVisualGridEnabled } = {}) {
  let result = ''
  switch (language) {
    case 'java-junit':
      result += `\nimport com.applitools.eyes.selenium.Eyes;\nimport com.applitools.eyes.RectangleSize;`
      if (isVisualGridEnabled) {
        result += `\nimport com.applitools.eyes.selenium.BrowserType;`
        result += `\nimport com.applitools.eyes.selenium.Configuration;`
        result += `\nimport com.applitools.eyes.visualgrid.model.DeviceName;`
        result += `\nimport com.applitools.eyes.visualgrid.model.ScreenOrientation;`
        result += `\nimport com.applitools.eyes.visualgrid.services.VisualGridRunner;`
        result += `\nimport com.applitools.eyes.selenium.fluent.Target;`
      }
      return result
  }
}

export function emitInEachEnd(language, { isVisualGridEnabled } = {}) {
  switch (language) {
    case 'java-junit':
      if (isVisualGridEnabled) return undefined
      else return `eyes.close();`
  }
}

export function emitVariable(language, { isVisualGridEnabled } = {}) {
  let result = ''
  switch (language) {
    case 'java-junit':
      result += `private Eyes eyes;`
      if (isVisualGridEnabled) {
        result += `\nprivate VisualGridRunner runner;\n`
        result += `final int concurrency = 5;\n`
        result += `private String preRenderHook;`
      }
      return result
  }
}
