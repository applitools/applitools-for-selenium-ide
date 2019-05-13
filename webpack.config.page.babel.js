import path from 'path'

export default {
  context: path.resolve(__dirname, 'src'),
  entry: {
    pageHandler: './page/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build/assets'),
    libraryTarget: 'var',
    filename: 'pageScripts.js',
  },
}
