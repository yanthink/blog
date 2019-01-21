import moment from 'moment';
import { round } from 'lodash';

export function fixedZero (val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance (type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode (nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase (n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * 10 ** index) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

function getRelation (str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1; // str1 包含 str2 eg. str1 = /foo/bar str2 = /foo
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2; // str2 包含 str1 eg. str1 = /foo str2 = /foo/bar
  }
  return 3;
}

function getRenderArr (routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes (path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path,
  );
  // Replace path to '' eg. path='auth' /auth/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl (path) {
  return reg.test(path);
}

export function getDateDiff (date) {
  const diffSeconds = moment().diff(moment(date), 's');
  const u = ['年', '个月', '星期', '天', '小时', '分钟', '秒'];
  const t = [31536000, 2592000, 604800, 86400, 3600, 60, 1];

  if (diffSeconds > t[0]) {
    return date;
  }

  for (let i = 1; i <= 6; i++) { // eslint-disable-line
    const inm = Math.floor(diffSeconds / t[i]);

    if (inm !== 0) {
      return `${inm}${u[i]}前`;
    }
  }

  return date;
}

export function formatReadCount (number) {
  const u = ['w', 'k'];
  const t = [10000, 1000];

  for (let i = 0; i <= 1; i++) { // eslint-disable-line
    if (number >= t[i]) {
      return `${round(number / t[i], 1).toFixed(1)}${u[i]}`;
    }
  }

  return number;
}

const dynamicLoaded = [];

export function dynamicLoad (srcs) {
  const srcList = Array.isArray(srcs) ? srcs : srcs.split(/\s+/);
  return Promise.all(srcList.map(src => {
    if (!dynamicLoaded[src]) {
      dynamicLoaded[src] = new Promise((resolve, reject) => {
        if (src.indexOf('.css') > 0) {
          const style = document.createElement('link');
          style.rel = 'stylesheet';
          style.type = 'text/css';
          style.href = src;
          style.onload = e => resolve(e);
          style.onerror = e => reject(e);
          document.head.appendChild(style);
        } else {
          const script = document.createElement('script');
          script.async = true;
          script.src = src;
          script.onload = e => resolve(e);
          script.onerror = e => reject(e);
          document.head.appendChild(script);
        }
      });
    }

    return dynamicLoaded[src];
  }));
}
