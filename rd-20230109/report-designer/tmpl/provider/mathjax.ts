import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.mathjax || (LOCALRES ? designer.resolve('../providers/mathjax@3.2.2/es5/') : '//unpkg.com/mathjax@3.2.2/es5/');
let dest = [base + 'tex-svg.js'];
export default () => Load('MathJax', dest);