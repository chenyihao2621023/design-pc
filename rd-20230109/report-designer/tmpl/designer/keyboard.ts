import Magix from 'magix5';
let { State, attach, detach } = Magix;
let Doc = document;
/**
 * 检测当前页面中的活动节点是否是可输入节点，通常像光标处于input这样标签里面时，需要把快捷键优先给系统使用
 * @param element 待检测节点
 */
let htmlNodeIsInputElement = (element: Report.ActiveType) => {
    //console.log('active', element);
    let parent = element.parentNode as Report.ActiveType;
    return element.tabIndex > -1 ||//有tabIndex
        element.isContentEditable ||//内容区可编辑
        (parent && parent.tabIndex > -1);//父节点有tabIndex
};
let nodeIsDisabled = (element: HTMLInputElement) => {
    return element.readOnly || element.disabled;
};
let keydownString = 'keydown';
//let InputRegexp = /^(?:input|textarea)$/i
//InputRegexp.test(active.tagName) ||;
let watchKeypress = (e: KeyboardEvent & {
    '@:{resume}': number
}) => {
    let { shiftKey,
        metaKey,
        ctrlKey,
        code,
        altKey,
        type,
        '@:{resume}': resume } = e;
    let active = Doc.activeElement;
    State.fire('@:{event#key.press}', {
        '@:{keypress#is.key.down}': type == keydownString,
        '@:{keypress#code}': code,
        '@:{keypress#shift.key}': shiftKey,
        '@:{keypress#ctrl.key}': metaKey || ctrlKey,
        '@:{keypress#alt.key}': altKey,
        '@:{keypress#active}': active,
        '@:{keypress#active.is.input}': !resume && htmlNodeIsInputElement(active as Report.ActiveType),
        '@:{keypress#active.is.disabled}': !resume && nodeIsDisabled(active as HTMLInputElement),
        '@:{keypress#prevent.default}'() {
            e.preventDefault();
        }
    });
};
let numbersMap = {};
for (let i = 0; i < 9; i++) {
    numbersMap[`Digit${i + 1}`] = i;
}
export default {
    /**
     * 以下导出code供外部统一使用
     */
    '@:{key#escape}': 'Escape',
    '@:{key#backspace}': 'Backspace',
    '@:{key#tab}': 'Tab',
    '@:{key#left}': 'ArrowLeft',
    '@:{key#up}': 'ArrowUp',
    '@:{key#right}': 'ArrowRight',
    '@:{key#down}': 'ArrowDown',
    '@:{key#delete}': 'Delete',
    '@:{key#enter}': 'Enter',
    '@:{key#a}': 'KeyA',
    '@:{key#b}': 'KeyB',
    '@:{key#c}': 'KeyC',
    '@:{key#d}': 'KeyD',
    '@:{key#e}': 'KeyE',
    '@:{key#f}': 'KeyF',
    '@:{key#g}': 'KeyG',
    '@:{key#h}': 'KeyH',
    '@:{key#k}': 'KeyK',
    '@:{key#l}': 'KeyL',
    '@:{key#i}': 'KeyI',
    '@:{key#m}': 'KeyM',
    '@:{key#n}': 'KeyN',
    '@:{key#p}': 'KeyP',
    '@:{key#r}': 'KeyR',
    '@:{key#s}': 'KeyS',
    '@:{key#t}': 'KeyT',
    '@:{key#u}': 'KeyU',
    '@:{key#v}': 'KeyV',
    '@:{key#w}': 'KeyW',
    '@:{key#x}': 'KeyX',
    '@:{key#y}': 'KeyY',
    '@:{key#z}': 'KeyZ',
    '@:{key#space}': 'Space',
    '@:{key#ctrl.plus}': 'Equal',
    '@:{key#ctrl.minus}': 'Minus',
    '@:{key#num.zero}': 'Digit0',
    '@:{key#slash}': 'Slash',
    '@:{key#custom.rotate}': '@:{key#custom.rotate}',
    '@:{key#custom.force.open.panel}': '@:{key#custom.force.open.panel}',
    '@:{key#numbers.map}': numbersMap,
    '@:{key#setup.monitor}'() {
        attach(Doc, keydownString, watchKeypress);
        attach(Doc, 'keyup', watchKeypress);
    },
    '@:{key#teardown.monitor}'() {
        detach(Doc, keydownString, watchKeypress);
        detach(Doc, 'keyup', watchKeypress);
    },
    '@:{key#is.input.element}': htmlNodeIsInputElement
};