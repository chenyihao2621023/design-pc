import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.chartjs ||(LOCALRES ? designer.resolve('../providers/chart.js@4.1.1/dist/') : '//unpkg.com/chart.js@4.1.1/dist/');
let dest = [base + 'chart.min.js'];
export default () => Load('Chart', dest);