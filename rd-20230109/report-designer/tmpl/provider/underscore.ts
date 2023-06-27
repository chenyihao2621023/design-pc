import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.underscore || (LOCALRES ? designer.resolve('../providers/underscore@1.13.6/dist/') : '//unpkg.com/underscore@1.13.6/');
let dest = [base + 'underscore-umd-min.js'];
export default () => Load('_', dest);