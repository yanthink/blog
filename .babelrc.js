const path = require('path');

module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': path.resolve(__dirname, 'src/'),
          components: path.join(__dirname, './src/components'),
          common: path.resolve(__dirname, 'src/common/'),
          layouts: path.resolve(__dirname, 'src/layouts/'),
          models: path.resolve(__dirname, 'src/models/'),
          routes: path.resolve(__dirname, 'src/routes/'),
          services: path.resolve(__dirname, 'src/services/'),
          utils: path.resolve(__dirname, 'src/utils/'),
        },
      },
    ],
    [
      'import',
      {
        libraryName: 'antd',
        style: true, // or 'css'
      },
    ],
  ],
};
