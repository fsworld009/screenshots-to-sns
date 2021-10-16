/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  configureWebpack: {},
  chainWebpack: (config) => {
    config
      .entry('app')
      .clear()
      .add('./src/ui/main.ts')
      .end();
    config.resolve.alias
      .set('@', path.join(__dirname, './src'));
  },
};
