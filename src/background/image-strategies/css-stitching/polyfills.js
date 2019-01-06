import fs from 'fs'
import url from 'url'

fs.open = () => {}
url.URL = URL
process.hrtime = require('browser-process-hrtime')
