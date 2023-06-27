import Magix from 'magix5';
import Load from './loader';

let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.leaflet || (LOCALRES ? designer.resolve('../providers/leaflet@1.9.3/dist/') : '//unpkg.com/leaflet@1.9.3/dist/');
let dest = [base + 'leaflet.css', base + 'leaflet.js'];

export default () => Load('L', dest);