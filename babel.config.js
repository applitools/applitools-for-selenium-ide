module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '67',
          firefox: '59',
        },
      },
    ],
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-object-rest-spread',
  ],
}
