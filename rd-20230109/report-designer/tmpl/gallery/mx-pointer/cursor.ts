//import Magix from 'magix5';
//let { node, guid, applyStyle } = Magix;
// let CursorId = guid('_mx_cursor_');
let docBody = document.body;
let bodyStyle = docBody.style;
let bodyClassList = docBody.classList;
let globalSelector = '@:scoped.style:designer-global-cursor';
let preGlobalCursor;
// let nodeStyle;
//applyStyle('@:cursor.less');
export default {
    '@:{show}'(e: HTMLElement) {
        let styles = getComputedStyle(e);
        this['@:{show.by.type}'](styles.cursor);
    },
    // '@:{show.by.type}'(cursor: string) {
    //     let n = node(CursorId);
    //     if (!n) {
    //         docBody.insertAdjacentHTML('beforeend', `<div class="@:./cursor.less:cursor @:scoped.style:{unselectable,full-fill}" id="${CursorId}"/>`);
    //         n = node(CursorId);
    //         nodeStyle = n.style;
    //     }
    //     nodeStyle.cursor = cursor;
    //     nodeStyle.display = 'block';
    // },
    // '@:{hide}'() {
    //     let n = node(CursorId);
    //     if (n) {
    //         nodeStyle.display = 'none';
    //     }
    // },
    '@:{show.by.type}'(cursor: string) {
        preGlobalCursor = getComputedStyle(docBody).cursor;
        bodyStyle.cursor = cursor;
        bodyClassList.add(globalSelector);
    },
    '@:{hide}'() {
        bodyStyle.cursor = preGlobalCursor;
        bodyClassList.remove(globalSelector);
    }
}