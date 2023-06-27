import Magix from 'magix5';
import Load from './loader';
let { config } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.ckeditor || (LOCALRES ? designer.resolve('../providers/ckeditor5@35.4.0/') : '//ckeditor.com/assets/libs/ckeditor5/35.4.0/');
let dest = [base + 'ckeditor.js'];
export default () => Load('CKEditor', dest);