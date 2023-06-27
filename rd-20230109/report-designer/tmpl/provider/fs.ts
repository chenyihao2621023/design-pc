import Toast from '../gallery/mx-toast/index';
import I18n from '../i18n/index';
import FileSaverProvider from './filesaver';
//检测是否支持最新的对话框读取和保存文件
let transitional = true;
//https://github.com/GoogleChromeLabs/browser-fs-access/blob/main/src/supported.mjs
try {
    // This will succeed on same-origin iframes,
    // but fail on cross-origin iframes.
    top.location + '';
    transitional = false;
} catch {
}
if (!transitional) {
    transitional = (!window.showOpenFilePicker && !window.showSaveFilePicker);
}
let fileDescription = 'Report Designer File';
let defaultFileExt = ['.rd'];
/**
 * 以字符串结果读取文件
 * @param file 文件对象
 * @returns 
 */
let readFile = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = e => {
            resolve(<string>e.target.result);
        };
        reader.onerror = e => {
            reject(e);
        };
        reader.readAsText(file);
    });
};
//以下用于读取和保存对话框的id
let writeId = '_rd_read';
let readId = '_rd_write';
export default {
    /**
     * 是否使用原生的文件上传
     * @returns 
     */
    '@:{native.file.element}'() {
        return transitional;
    },
    /**
     * 环境准备，如果不支持最新的对话框的形式，则采用`saveAs`插件进行保存
     */
    async '@:{prepare}'() {
        if (transitional &&
            !window.saveAs) {
            try {
                Toast.show(I18n('@:{lang#elements.loading.library.tip}'));
                await FileSaverProvider();
            } catch (ex) {
                throw ex;
            } finally {
                Toast.hide();
            }
        }
    },
    /**
     * 读取文件内容
     * @param nativeInputElement <input type="file"/>节点对象
     * @returns 
     */
    async '@:{read.file}'(nativeInputElement?: HTMLInputElement,
        accept = defaultFileExt) {
        if (transitional) {
            let file = nativeInputElement.files[0];
            if (file) {
                nativeInputElement.value = '';
                return await readFile(file);
            }
            return '';
        }
        let [readable] = await showOpenFilePicker({
            id: readId,
            excludeAcceptAllOption: true,
            types: [{
                description: fileDescription,
                accept: {
                    'text/plain': accept
                }
            }]
        });
        let f = await readable.getFile();
        return await f.text();
    },
    /**
     * 保存文件
     * @param name 文件名称
     * @param content 文件内容
     */
    async '@:{save.file}'(name, content, accept = defaultFileExt) {
        if (transitional) {
            let b = new Blob([content]);
            saveAs(b, name);
        } else {
            let fd = await showSaveFilePicker({
                id: writeId,
                suggestedName: name,
                startIn: 'downloads',
                types: [{
                    description: fileDescription,
                    accept: {
                        'text/plain': accept,
                    },
                }],
            });
            let writable = await fd.createWritable();
            await writable.write(content);
            await writable.close();
        }
    }
};