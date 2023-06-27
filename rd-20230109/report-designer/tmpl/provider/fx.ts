import Magix from 'magix5';
import Load from './loader';

let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.fx || (LOCALRES ? designer.resolve('../providers/function-plot@1.23.2/dist/') : '//unpkg.com/function-plot@1.23.2/dist/');
let dest = [base + 'function-plot.js'];
export default () => Load('functionPlot', dest);