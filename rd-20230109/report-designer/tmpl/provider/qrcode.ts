import Magix from 'magix5';
import Load from './loader';

let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.qrcode || (LOCALRES ? designer.resolve('../providers/qrcode@1.0.2/') : '//unpkg.com/@keeex/qrcodejs-kx@1.0.2/');
let dest = [base + 'qrcode.min.js'];
export default {
    '@:{correct.levels}': [{
        text: '@:{lang#qrcode.correct.l}',
        value: 'L'
    }, {
        text: '@:{lang#qrcode.correct.m}',
        value: 'M'
    }, {
        text: '@:{lang#qrcode.correct.q}',
        value: 'Q'
    }, {
        text: '@:{lang#qrcode.correct.h}',
        value: 'H'
    }],
    '@:{load.library}'() {
        return Load('QRCode', dest);
    }
}