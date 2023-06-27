import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.filesaver || (LOCALRES ? designer.resolve('../providers/file-saver@2.0.5/dist/') : '//unpkg.com/file-saver@2.0.5/dist/');
let dest = [base + 'FileSaver.min.js'];
export default () => Load('saveAs', dest);