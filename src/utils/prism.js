import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import loadLanguages from 'prismjs/components/index';

loadLanguages([
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
]);

export { loadLanguages };
export default Prism;
