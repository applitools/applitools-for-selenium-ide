import fs from 'fs'

fs.open = () => {}
process.hrtime = require('browser-process-hrtime')
