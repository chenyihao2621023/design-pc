/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Runner from '../../../gallery/mx-runner/index';
let { View, node, now, isArray } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.on('destroy', () => {
            Runner['@:{task.remove}'](this['@:{working.task}']);
        });
    },
    assign(data) {
        let { props } = data;
        let { bind, speed, reverse } = props;
        if (bind._data &&
            bind.fields?.length) {
            let src = bind._data;
            if (isArray(src)) {
                src = src[0];
            }

            let workingField = bind.fields[0];
            if (workingField?.key) {
                props.working = src?.[workingField.key];
            }
            let speedField = bind.fields[1];
            if (speedField?.key) {
                speed = src?.[speedField.key];
            }
        }
        this.set(data, {
            reverse,
            speed: Math.pow(1.8, speed + 1)
        });
    },
    async render() {
        await this.digest();
        if (!this['@:{working.task}']) {
            this['@:{path.node}'] = node(`_rd_${this.id}`);
            this['@:{last.time}'] = now();
            this['@:{degree.offset}'] = 0;
            this['@:{working.task}'] = () => {
                let { speed, reverse } = this.get();
                let dur = ((now() - this['@:{last.time}']) / 100) % speed;
                if (reverse) {
                    dur = speed - dur;
                }
                let degree = (dur / speed * 360 + this['@:{degree.offset}']) % 360;
                this['@:{current.degree}'] = degree;
                let path = <HTMLDivElement>this['@:{path.node}'];
                path.setAttribute('transform', `rotate(${degree},500,510)`);
            };
        }
        let p = this.get('props');
        if (p.working) {
            if (!this['@:{is.working}']) {
                this['@:{is.working}'] = 1;
                this['@:{last.time}'] = now();
                Runner['@:{task.add}'](40, this['@:{working.task}']);
            } else {
                //工作中变速，需要从当前角度开始，否则会有跳跃感觉
                let speed = this.get('speed');
                let reverse = this.get('reverse');
                let realDegree = ((this['@:{current.degree}'] ?? 0) - this['@:{degree.offset}'] + 360) % 360;
                let progress = realDegree / 360 * speed;
                if (reverse) {
                    progress = speed - progress;
                }
                this['@:{last.time}'] = now() - progress * 100;
            }
        } else if (this['@:{is.working}']) {
            Runner['@:{task.remove}'](this['@:{working.task}']);
            this['@:{is.working}'] = 0;
            this['@:{degree.offset}'] = this['@:{current.degree}'] ?? 0;
        }
    }
});