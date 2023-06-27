import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.jspdf || (LOCALRES ? designer.resolve('../providers/jspdf@2.5.1/dist/') : '//unpkg.com/jspdf@2.5.1/dist/');
let dest = [base + 'jspdf.umd.min.js'];
export default () => Load('jspdf', dest);