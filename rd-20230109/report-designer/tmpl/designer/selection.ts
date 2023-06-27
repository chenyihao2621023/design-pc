/**
 * 元素选区相关
 */
import Magix from 'magix';
let { toMap, State } = Magix;
let selectedMap;
export default {
    /**
     * 设置单个元素选中状态
     * @param element 被选择的元素
     */
    '@:{selection#set}'(element?: Report.StageElement): Report.StageElement[] | null {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let oldCount = selectElements.length;
        if (oldCount || element) {
            let oldSelectElements = selectElements.slice();
            //判断旧选中，如果有多个，现在只选中一个，则更新
            //如果旧选中只有一个，且为当前元素，则不更新
            let first = oldCount > 1 ? null : selectElements[0];
            let update;
            if (element) {
                if (element != first) {
                    selectElements.length = 1;
                    selectElements[0] = element;
                    update = 1;
                }
            } else if (oldCount) {//如果清空选择，且之前有元素选中，则更新
                selectElements.length = 0;
                update = 1;
            }
            if (update) {
                selectedMap = 0;
                State.fire('@:{event#stage.select.elements.change}');
                return oldSelectElements;
            }
        }
    },
    /**
     * 向选区追加选中的元素
     * @param element 添加到选区中的元素
     */
    '@:{selection#add}'(element: Report.StageElement): boolean | number {
        let selectElements = State.get('@:{global#stage.select.elements}') as Report.StageElement[];
        let find;
        for (let e of selectElements) {//先查找是否已经存在
            if (e.id === element.id) {
                find = 1;
                break;
            }
        }
        if (!find) {//如果未存在，则更新
            selectElements.push(element);
            selectedMap = 0;

            State.fire('@:{event#stage.select.elements.change}');
            return 1;
        }
    },
    /**
     * 获取选中元素根据id组成的集合对象
     * @returns id集合对象
     */
    '@:{selection#get.selected.map}'() {
        if (!selectedMap) {
            let selectElements = State.get('@:{global#stage.select.elements}');
            selectedMap = toMap(selectElements, 'id');
        }
        return selectedMap;
    },
    /**
     * 移除选中的元素
     * @param element 待移除的元素
     */
    '@:{selection#remove}'(element: Report.StageElement): boolean | number {
        let selectElements = State.get('@:{global#stage.select.elements}');
        for (let i = selectElements.length; i--;) {
            let e = selectElements[i];
            if (e.id === element.id) {
                selectElements.splice(i, 1);

                selectedMap = 0;

                State.fire('@:{event#stage.select.elements.change}');
                return 1;
            }
        }
    },
    /**
     * 清除之前的元素并把传递来的列表做为选中
     * @param elements 元素列表
     */
    '@:{selection#set.all}'(elements?: Report.StageElement[]) {
        let last = this['@:{selection#get.selected.map}']();
        let selectElements = State.get('@:{global#stage.select.elements}');
        selectElements.length = 0;
        selectedMap = 0;
        if (elements) {
            selectElements.push(...elements);
        }
        let changed = this["@:{selection#has.changed}"](last)['@:{selection.changed#has.diffed}'];
        if (changed) {
            State.fire('@:{event#stage.select.elements.change}');
        }
        return changed;
    },
    /**
     * 清除id对象
     */
    '@:{selection#reset.map}'() {
        selectedMap = 0;
    },
    /**
     * 判断选中状态是否发生过改变
     * @param last 历史选中状态的id映射
     */
    '@:{selection#has.changed}'(last: Report.NumberMapObject): Report.StageSelectionChangeInfo {
        let now = this['@:{selection#get.selected.map}']();
        let nowCount = 0,
            diff = 0,
            selectedElements = [],
            deselectedElements = [];
        for (let p in last) {
            if (!now[p]) {
                diff++;
                deselectedElements.push(last[p]);
            } else {
                selectedElements.push(last[p]);
            }
        }
        for (let p in now) {
            nowCount++;
            if (!last[p]) {
                diff++;
                selectedElements.push(now[p]);
            }
        }
        return {
            '@:{selection.changed#has.diffed}': diff,
            '@:{selection.changed#now.count}': nowCount,
            '@:{selection.changed#selected.elements}': selectedElements,
            '@:{selection.changed#deselected.elements}': deselectedElements
        };
    }
};
