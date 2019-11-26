# Generated by Selenium IDE
import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import os
from urllib.parse import urlparse
from applitools.selenium import (Eyes, Target)
from applitools.selenium import (Configuration, BrowserType, DeviceName, ScreenOrientation)
from applitools.selenium.visual_grid import VisualGridRunner

class TestUntitleddddddddddddddddddddddddddddd():
  def setup_method(self, method):
    self.driver = webdriver.Remote(
                  command_executor='http://selenium:4444/wd/hub',
                  desired_capabilities=DesiredCapabilities.CHROME)
    self.vars = {}
    concurrency = 10
    self.vg_runner = VisualGridRunner(concurrency)
    self.eyes = Eyes(self.vg_runner)
    config = Configuration()
    config.add_browser(2048, 1536, BrowserType.CHROME)
    config.add_device_emulation(DeviceName.iPhone6_7_8_Plus, ScreenOrientation.LANDSCAPE)
    self.eyes.configuration = config
    self.eyes.api_key = os.environ["APPLITOOLS_API_KEY"]
    self.eyes.baseline_env_name = "asdfasdfjkjkjjasdfjasfjasdfj"
    self.eyes.open(self.driver, "kkkk", "Untitleddddddddddddddddddddddddddddd")
  
  def teardown_method(self, method):
    self.driver.quit()
    self.vg_runner.get_all_test_results()
  
  def test_untitleddddddddddddddddddddddddddddd(self):
    self.driver.get("https://www.google.com/")
    self.eyes.viewport_size = {'width': 1440, 'height': 998}
    self.eyes.check(urlparse(self.driver.current_url).path, Target.window().fully(True))
    self.eyes.check(urlparse(self.driver.current_url).path, Target.region([By.NAME, "q"]))
    self.eyes.close_async()
  