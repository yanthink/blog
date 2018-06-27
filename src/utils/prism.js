import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import loadLanguages from 'prismjs/components/index';

loadLanguages([
  'markup',
  'css',
  'javascript',
  'bash',
  'git',
  'http',
  'ini',
  'java',
  'json',
  'less',
  'markdown',
  'nginx',
  'php',
  'php-extras',
  'python',
  'jsx',
  'tsx',
  'scss',
  'sql',
  'vim',
  'yaml',
]);

export { loadLanguages };
export default Prism;
