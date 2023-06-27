import Magix from 'magix5';
import Load from './loader';

let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.html2canvas || (LOCALRES ? designer.resolve('../providers/html2canvas@1.4.1/dist/') : '//unpkg.com/html2canvas@1.4.1/dist/');
let dest = [base + 'html2canvas.min.js'];
export default () => Load('html2canvas', dest);