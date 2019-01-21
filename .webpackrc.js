// see https://github.com/sorrycc/roadhog/blob/master/README_zh-cn.md
const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    [
      'prismjs',
      {
        languages: [
          'css',
          'javascript',
          'bash',
          'ini',
          'java',
          'json',
          'less',
          'php',
          'jsx',
          'tsx',
          'sass',
          'scss',
          'sql',
          'stylus',
          'typescript',
          'yaml',
        ],
        plugins: ['line-numbers'],
        theme: 'okaidia',
        css: true,
      },
    ],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
      proxy: {
        '/api': {
          target: 'http://api.blog.test/',
          changeOrigin: true,
        },
        '/_debugbar': {
          target: 'http://api.blog.test/',
          changeOrigin: true,
        },
      },
    },
  },
  alias: {
    '@': path.resolve(__dirname, 'src/'),
    components: path.resolve(__dirname, 'src/components/'),
    common: path.resolve(__dirname, 'src/common/'),
    layouts: path.resolve(__dirname, 'src/layouts/'),
    models: path.resolve(__dirname, 'src/models/'),
    routes: path.resolve(__dirname, 'src/routes/'),
    services: path.resolve(__dirname, 'src/services/'),
    utils: path.resolve(__dirname, 'src/utils/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  // disableDynamicImport: true,
  // disableCSSModules: true,
  publicPath: '/',
  hash: true,
};
