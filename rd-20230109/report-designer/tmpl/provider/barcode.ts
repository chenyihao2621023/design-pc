import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.barcode || (LOCALRES ? designer.resolve('../providers/jsbarcode@3.11.5/dist/') : '//unpkg.com/jsbarcode@3.11.5/dist/');
let dest = [base + 'JsBarcode.all.js'];
export default {
    '@:{types}': [{ value: 'CODE128', text: 'CODE128' },//条形码类型
    { value: 'CODE128A', text: 'CODE128A' },
    { value: 'CODE128B', text: 'CODE128B' },
    { value: 'CODE128C', text: 'CODE128C' },
    { value: 'CODE39', text: 'CODE39' },
    { value: 'EAN2', text: 'EAN2' },
    { value: 'EAN5', text: 'EAN5' },
    { value: 'EAN8', text: 'EAN8' },
    { value: 'EAN13', text: 'EAN13' },
    { value: 'ITF', text: 'ITF' },
    { value: 'ITF14', text: 'ITF14' },
    { value: 'MSI', text: 'MSI' },
    { value: 'MSI10', text: 'MSI10' },
    { value: 'MSI11', text: 'MSI11' },
    { value: 'MSI1010', text: 'MSI1010' },
    { value: 'MSI1110', text: 'MSI1110' },
    { value: 'UPC', text: 'UPC' },
    { value: 'UPCE', text: 'UPCE' },
    { value: 'upce', text: 'UPC-E' },
    { value: 'codabar', text: 'codabar' },
    { value: 'pharmacode', text: 'pharmacode' },
    { value: 'GenericBarcode', text: 'GenericBarcode' }],
    '@:{render.types}': [{
        text: '@:{lang#props.render.image}',
        value: 'img'
    }, {
        text: '@:{lang#props.render.svg}',
        value: 'svg'
    }],
    '@:{fill.types}': [{
        text: '@:{lang#props.full}',
        value: 'full'
    }, {
        text: '@:{lang#props.auto}',
        value: 'auto'
    }],
    '@:{text.positions}': [{
        text: '@:{lang#dir.top}',
        value: 'top'
    }, {
        text: '@:{lang#dir.bottom}',
        value: 'bottom'
    }],
    '@:{text.style}': {
        bold: 1,
        italic: 1
    },
    '@:{load.library}'() {
        return Load('JsBarcode', dest);
    }
};