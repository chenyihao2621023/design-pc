import Magix from 'magix5';
import Load from './loader';

let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.luckysheet || (LOCALRES ? designer.resolve('../providers/luckysheet@2.1.13/dist/') : '//unpkg.com/luckysheet@2.1.13/dist/');
let preloads = [
    base + 'plugins/css/pluginsCss.css',
    base + 'plugins/plugins.css',
    base + 'css/luckysheet.css',
    base + 'assets/iconfont/iconfont.css',
    base + 'plugins/js/plugin.js'
];
let main = [base + 'luckysheet.umd.js'];
export default () => Load('luckysheet', main, preloads);