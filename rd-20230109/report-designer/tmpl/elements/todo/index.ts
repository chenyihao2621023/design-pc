/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Keyboard from '../../designer/keyboard';
let { View, applyStyle, node, State } = Magix;
applyStyle('@:./index.less');
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest({
            scale: State.get('@:{global#stage.scale}') || 1
        });
    },
    '@:{update.size}'() {
        let todoNode = node<HTMLElement>(`todo_${this.id}`);
        if (todoNode) {
            //let h = todoNode.offsetHeight;
            let childNodes = todoNode.childNodes;
            let scale = State.get<number>('@:{global#stage.scale}') || 1
            let h = 2 * scale;
            for (let i = childNodes.length; i--;) {
                let c = childNodes[i];
                if (c.nodeType == 1) {
                    h += (c as HTMLDivElement).offsetHeight * scale;
                }
            }
            let props = this.get('props');
            props.height = Const['@:{const#to.unit}'](h);
            console.log(h);
            this.digest({
                props
            });
        }
    },
    async '@:{watch.key.down}<keydown>'({ code, eventTarget }: Magix5.MagixKeyboardEvent) {
        if (code == Keyboard['@:{key#enter}']) {
            let ipt = (eventTarget as HTMLInputElement);
            let v = ipt.value;//.trim();
            if (v) {
                ipt.value = '';
                let props = this.get('props');
                props.todos.push({
                    task: v,
                    complete: false
                });
                await this.digest({
                    props
                });
                this['@:{update.size}']();
            }
        }
    },
    async '@:{remove.task.at}<click>'(e: Magix5.MagixPointerEvent) {
        let { index } = e.params;
        let props = this.get('props');
        props.todos.splice(index, 1);
        await this.digest({
            props
        });
        this['@:{update.size}']();
    },
    '@:{change.task.status}<change>'(e: Magix5.MagixPointerEvent) {
        let { index } = e.params;
        let props = this.get('props');
        let todo = props.todos[index];
        todo.complete = (e.eventTarget as HTMLInputElement).checked;
        this.digest({
            props
        });
    },
    '@:{stop}<pointerdown,contextmenu>'(e: PointerEvent) {
        if (!e['@:{halt}']) {
            e['@:{halt}'] = 1;
        }
    }
});