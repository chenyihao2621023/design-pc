/*
    author:https://github.com/xinglie
*/
'ref@:./index.less';
import Magix from 'magix5';
import Const from '../designer/const';
import Enum from '../designer/enum';
import StageGeneric from '../designer/generic';
import StageSelection from '../designer/selection';
import Dragdrop from '../gallery/mx-dragdrop/index';
import EBaseProvider from '../provider/ebase';
import GenericProvider from '../provider/generic';
let { State, has, View } = Magix;
let CellAndHod = Enum['@:{enum#as.hod}'] | Enum['@:{enum#as.cells}'];
export default View.extend({
    tmpl: '@:designer.html',
    init() {
        this.set({
            denum: Enum,
            hmSize: Const['@:{const#element.auto.show.icon.less.than}'],
            //touch: State.get('@:{global#stage.is.touch}'),
            cursor: GenericProvider['@:{generic#cursor.shape}'],
            //minSize: () => Const['@:{const#to.unit}'](1),
            whEnum: Enum['@:{enum#modifier.width}'] | Enum['@:{enum#modifier.height}'],
            toPx: Const['@:{const#to.px}'],
        });
    },
    // '@:{pointer.dblclick}'(element){
    //     console.log(element);
    // },
    // '@:{pointer.click}'(e){
    //     console.log(e);
    // },
    '@:{icon.pointer.down}'(element: Report.StageElement) {
        //以下是格子元素取消选中格子的操作
        let { ctrl, props } = element;
        if ((ctrl.as & CellAndHod) &&
            (props.focusCol != -1 ||
                props.focusRow != -1)) {
            props.focusRow = -1;
            props.focusCol = -1;
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{focus.cell}', this.owner);
        }
    },
    '@:{check.status}'() {
        let map = StageSelection['@:{selection#get.selected.map}']();
        let elements = State.get('@:{global#stage.select.elements}');
        let count = elements.length;
        let element = this.get('element');
        if (element) {
            let id = element.id;
            let groups = State.get('@:{global#stage.elements.groups}');
            let list = groups[id],
                grouped = 0;
            if (!map[id] &&
                list) {
                for (let n of list) {
                    if (map[n]) {
                        grouped = 1;
                        break;
                    }
                }
            }
            // if (data.selected) {
            //     if (!Has(map, id)) {
            //         let vf = Vframe.get('entity_' + this.id);
            //         if (vf) {
            //             vf.invoke('@:{lost.select}');
            //         }
            //     }
            // } else {
            //     if (Has(map, id)) {
            //         let vf = Vframe.get('entity_' + this.id);
            //         if (vf) {
            //             vf.invoke('@:{got.select}');
            //         }
            //     }
            // }
            //console.log(Has(map, id));
            let selected = has(map, id);
            if (!selected) {
                //element.props['@:{focus.mod}'] = '';
                //element.props['@:{show.text}'] = 0;
                let start = this.root;
                while (start &&
                    start.id != '_rd_sc') {//修复在overflow hidden下有输入框，容器会向上滚动以以显示，当输入框隐藏时，需要滚动回来
                    if (start.dataset?.as == 'hod') {
                        start.scrollTo(0, 0);
                        break;
                    }
                    start = start.parentNode as HTMLElement;
                }
            }
            this.set({
                selfGrouped: list,
                grouped,
                selected,
                count
            });
        }
    },
}).merge(Dragdrop, EBaseProvider);