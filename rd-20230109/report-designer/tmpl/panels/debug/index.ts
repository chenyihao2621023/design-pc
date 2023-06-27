import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DHistory from '../../designer/history';
import StageClipboard from '../../designer/clipboard';
import StageGeneric from '../../designer/generic';
import Elements from '../../elements/index';
import Dialog from '../../gallery/mx-dialog/index';

let randomRange = (min, max) => min + ((Math.random() * (max - min + 1)) | 0);
let { View, applyStyle, State, Vframe, node, isFunction, config } = Magix;
applyStyle('@:index.less');
let c = window.console;

export default View.extend({
    tmpl: '@:index.html',
    '@:{show}'(shrink) {
        let perf = node(`_rd_${this.id}_perf`);
        let vf = Vframe.byNode(perf);
        vf?.invoke('@:{show}', shrink);
    },
    '@:{hide}'() {
        let perf = node(`_rd_${this.id}_perf`);
        let vf = Vframe.byNode(perf);
        vf?.invoke('@:{hide}');
    },
    render() {
        this.digest({
            lang: config('lang')
        });
    },
    '@:{log.state}<click>'() {
        c.log(State);
    },
    '@:{log.state.data}<click>'() {
        c.log(State.get());
    },
    '@:{log.history.data}<click>'() {
        c.log(DHistory['@:{history#get.history.info}']());
    },
    '@:{log.vom}<click>'() {
        c.log(Vframe.all());
    },
    '@:{log.stage.elements}<click>'() {
        c.log(State.get('@:{global#stage.elements}'));
    },
    '@:{log.select.elements}<click>'() {
        c.log(State.get('@:{global#stage.select.elements}'));
    },
    '@:{log.clipboard}<click>'() {
        let list = StageClipboard['@:{get.copy.list}']();
        if (list?.length) {
            let isCut = StageClipboard['@:{is.cut}']();
            if (isCut) {
                c.log('剪切的元素', list);
            } else {
                c.log('复制的元素', list);
            }
        } else {
            c.log('剪切板无内容');
        }
    },
    '@:{clear.clipboard}<click>'() {
        StageClipboard['@:{clear}']();
    },
    '@:{add.text.to.cell}<click>'() {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let find
        if (selectElements?.length == 1) {
            let { ctrl, props } = selectElements[0];
            if (ctrl.as & Enum['@:{enum#as.hod}']) {
                let { focusRow, focusCol, rows } = props;
                if (focusRow > -1 &&
                    focusCol > -1) {
                    find = 1;
                    let page = State.get('@:{global#stage.page}');
                    let addText = {
                        id: Magix.guid('text_'),
                        type: 'text',
                        props: {
                            x: Const['@:{const#to.unit}'](randomRange(0, 30)),
                            y: Const['@:{const#to.unit}'](randomRange(0, 20)),
                            text: '测试内容'
                        }
                    };
                    let {
                        '@:{emanager#elements}': translatedElements
                    } = Elements['@:{element.manager#by.json}']([addText], page, true);
                    let cell = rows[focusRow].cols[focusCol];
                    if (cell.elements) {
                        let historyTitle = StageGeneric['@:{generic#query.element.name}'](translatedElements);
                        cell.elements.push(...translatedElements);
                        //以下事件必须派发，通知其它view元素有变化
                        State.fire('@:{event#stage.elements.change}');
                        //历史记录可根据情况可存可不存
                        DHistory['@:{history#save}'](DHistory['@:{history#element.added}'], historyTitle);
                    }
                }
            }
        }
        if (!find) {
            this.alert('请选中一个容器的格子查看效果')
        }
    },
    '@:{add.text.to.stage}<click>'() {
        let stageElements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
        let scale = State.get<number>('@:{global#stage.scale}');
        let page = State.get<Report.StagePage>('@:{global#stage.page}');
        let elementsMap = State.get<Report.StageElementCtrlMapObject>('@:{global#stage.elements.map}');
        let textCtrl = elementsMap.text;
        let addText = {
            id: Magix.guid('text_'),
            ctrl: textCtrl,
            type: 'text',
            props: textCtrl['@:{get.props}'](0, 0)
        } as Report.StageElement;
        addText.props.x = Const['@:{const#to.unit}'](randomRange(0, 30));
        addText.props.y = Const['@:{const#to.unit}'](randomRange(0, 20));
        addText.props.text = '测试内容';
        addText.props.ename = '测试文本';
        if (page.readonly) {//如果整个设计区只读，则元素只读
            addText.props.readonly = true;
        }
        for (let s of textCtrl.props) {
            if (isFunction(s['@:{stage.scale}'])) {
                s['@:{stage.scale}'](addText.props, scale);
            } else if (s['@:{is.scale.and.unit.field}']) {
                addText.props[s.key] *= scale;
            }
        }
        if (textCtrl['@:{update.props}']) {
            textCtrl['@:{update.props}'](addText.props);
        }
        stageElements.push(addText);
        let historyTitle = StageGeneric['@:{generic#query.ename.by.single}'](addText);
        //以下事件必须派发，通知其它view元素有变化
        State.fire('@:{event#stage.elements.change}');
        //历史记录根据情况可存可不存
        DHistory['@:{history#save}'](DHistory['@:{history#element.added}'], historyTitle);
    },
    '@:{change.lang}<click>'() {
        let lang = config('lang');
        let to = lang == 'en' ? 'zh' : 'en';
        let langObj = {
            lang: to
        };
        this.digest(langObj);
        config(langObj);
        State.fire('@:{event#lang.change}', {
            to
        });
    }
}).merge(Dialog);