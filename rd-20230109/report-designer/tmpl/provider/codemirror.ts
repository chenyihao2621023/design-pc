import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.codemirror || (LOCALRES ? designer.resolve('../providers/codemirror@5.65.11/') : '//unpkg.com/codemirror@5.65.11/');
let preloads = [
    base + 'lib/codemirror.css',
    base + 'lib/codemirror.js'
];
let dest = [
    base + 'mode/javascript/javascript.js',
    base + 'mode/xml/xml.js',
    base + 'mode/css/css.js',
    base + 'mode/htmlmixed/htmlmixed.js'
];

export default () => Load('CodeMirror', dest, preloads);