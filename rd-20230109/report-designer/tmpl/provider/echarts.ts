import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.echarts || (LOCALRES ? designer.resolve('../providers/echarts@5.4.1/dist/') : '//unpkg.com/echarts@5.4.1/dist/');
let dest = [base + 'echarts.min.js'];
//let plugins = [base + 'extension/bmap.min.js', base + 'extension/dataTool.min.js'];
export default () => Load('echarts', dest);