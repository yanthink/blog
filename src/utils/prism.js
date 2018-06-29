import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import loadLanguages from 'prismjs/components/index';

loadLanguages([
  'css',
  'javascript',
  'bash',
  'git',
  'ini',
  'java',
  'json',
  'less',
  'markdown',
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
