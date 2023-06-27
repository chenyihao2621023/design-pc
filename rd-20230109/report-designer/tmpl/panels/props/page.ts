/*
    author:https://github.com/xinglie
*/
'ref@:./index.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import I18n from '../../i18n/index';
let { State, View, mark, isArray } = Magix;
export default View.extend({
    tmpl: '@:page.html',
    init() {
        let update = this.render.bind(this);
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            let data = {
                lang: to
            };
            let display = State.get<string>('@:{global#panels.props.display}');
            if (display == '@:{panels#props.display.page}') {
                this.digest(data);
            } else {
                this.set(data);
            }
        };
        State.on('@:{event#stage.page.change}', update);
        State.on('@:{event#history.shift.change}', update);
        State.on('@:{event#stage.page.and.elements.change}', update);
        State.on('@:{event#lang.change}', updateLang);
        this.on('destroy', () => {
            State.off('@:{event#stage.page.change}', update);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.page.and.elements.change}', update);
            State.off('@:{event#lang.change}', updateLang);
        });

        let groups,
            ctrl = State.get('@:{global#stage.page.ctrl}');
        let useGroup = Const['@:{const#panels.prop.show.group}'];
        let selected = this.get('selected');
        if (useGroup) {
            groups = StageGeneric['@:{generic#generate.groups}'](ctrl);
            if (!groups.includes(selected)) {
                selected = groups[0];
            }
        }
        this.set({
            ia: isArray,
            useGroup,
            groups,
            selected,
            types: Enum,
            ctrl
        })
    },
    render() {
        let page = State.get('@:{global#stage.page}');
        this.digest({
            page
        });
    },
    async '@:{update.prop}<input,change>'(e) {
        let { key, use, native, write } = e.params;
        if (!use) {
            use = e.use;
        }
        if (!key) {
            key = e.pkey;
        }
        let page = State.get('@:{global#stage.page}');
        let v = native ? e.eventTarget[native] : e[use];
        let marker = mark(this, '@:{update.props}');
        if (write) {
            await write(v, page, e);
        } else {
            page[key] = v;
        }
        if (marker()) {
            if (key == 'unit') {
                State.fire('@:{event#stage.unit.change}', {
                    '@:{to.unit}': v
                });
            } else {
                State.fire('@:{event#stage.page.change}');
            }
            DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], I18n('@:{lang#elements.page}'), '@:{history#stage.props.change}' + key, Const['@:{const#hisotry.save.continous.delay}']);
        }
    },
    '@:{update.image.size}<click>'(e: Magix5.MagixPointerEvent) {
        let page = State.get('@:{global#stage.page}');
        let img = new Image();
        let m = mark(this, '@:{update.img.size}');
        let setSize = () => {
            let newWidth = Const['@:{const#to.unit}'](img.width),
                newHeight = Const['@:{const#to.unit}'](img.height);
            if (m() &&
                (newWidth != page.backgroundWidth ||
                    newHeight != page.backgroundHeight)) {
                page.backgroundWidth = newWidth;
                page.backgroundHeight = newHeight;
                State.fire('@:{event#stage.page.change}');
                DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], I18n('@:{lang#elements.page}'));
            }
        };
        img.onload = setSize;
        img.src = page.backgroundImage;
        if (img.complete) {
            setSize();
        }
    },
    '@:{change.tab}<click>'({ params }: Magix5.MagixPointerEvent) {
        this.digest({
            selected: params.to
        });
    }
});