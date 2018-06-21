import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';

// import createHistory from 'history/createHashHistory';
// user BrowserHistory
import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';
import { message } from 'antd';
import 'moment/locale/zh-cn';
// import './rollbar';

import './index.less';
// 1. Initialize
const app = dva({
  history: createHistory(),
  async onError(error) {
    message.destroy();
    const { response } = error;
    if (response) {
      const { status } = response;
      if (status >= 422 && status < 500) {
        const { message: msg } = await response.json();
        message.error(msg);
      }
    }
  },
});

// 2. Plugins
app.use(createLoading());

// 3. Register global model
app.model(require('models/Admin/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

export default app._store; // eslint-disable-line
