import Magix from 'magix5';
import Load from './loader';

let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.swiper || (LOCALRES ? designer.resolve('../providers/swiper@8.4.5/') : '//unpkg.com/swiper@8.4.5/');
let dest = [base + 'swiper-bundle.min.css', base + 'swiper-bundle.min.js'];

export default () => Load('Swiper', dest);