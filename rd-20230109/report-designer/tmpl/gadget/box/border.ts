/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Transform from '../../designer/transform';
let { View, dispatch } = Magix;
let BorderTypeList = Const['@:{const#border.types}'];
let Borders = ['Top', 'Right', 'Bottom', 'Left'];
let BordersText = ['@:{lang#dir.top}',
    '@:{lang#dir.right}',
    '@:{lang#dir.bottom}',
    '@:{lang#dir.left}'];
let MODE_TIDY = 1,
    MODE_FULL = 2;
export default View.extend({
    tmpl: '@:./border.html',
    init() {
        this.set({
            MODE_TIDY,
            MODE_FULL,
            mode: MODE_TIDY,
            step: () => Const["@:{const#unit.step}"](),
            fixed: () => Const["@:{const#unit.fixed}"](),
            max: () => Const["@:{const#to.unit}"](10),
            read: Transform["@:{transform#to.show.value}"],
            bt: BordersText,
            borders: Borders,
            borderTypes: BorderTypeList
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{update.border.width}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { key } = e.params;
        let props = this.get('props');
        props[`border${key}Width`] = Transform["@:{transform#to.real.value}"](e.value);
        let mode = this.get('mode');
        if (mode == MODE_TIDY) {
            for (let i = 1; i < Borders.length; i++) {
                props[`border${Borders[i]}Width`] = props[`border${key}Width`];
            }
        }
        dispatch(this.root, 'change', {
            use: 'border',
        });
    },
    '@:{change.border.style}<change>'(e) {
        this['@:{stop.propagation}'](e);
        let { key } = e.params;
        let props = this.get('props');
        props[`border${key}Style`] = e.value;
        let mode = this.get('mode');
        if (mode == MODE_TIDY) {
            for (let i = 1; i < Borders.length; i++) {
                props[`border${Borders[i]}Style`] = props[`border${key}Style`];
            }
        }
        dispatch(this.root, 'change', {
            use: 'border',
        });
    },
    '@:{update.border.color}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { key } = e.params;
        let props = this.get('props');
        props[`border${key}Color`] = e.color;
        let mode = this.get('mode');
        if (mode == MODE_TIDY) {
            for (let i = 1; i < Borders.length; i++) {
                props[`border${Borders[i]}Color`] = props[`border${key}Color`];
            }
        }
        dispatch(this.root, 'change', {
            use: 'border'
        });
    },
    '@:{change.mode}<click>'({ params }) {
        let { to } = params,
            changed;
        if (to == MODE_TIDY) {
            let props = this.get('props');
            for (let i = 1; i < Borders.length; i++) {
                if (props[`border${Borders[i]}Color`] != props.borderTopColor) {
                    props[`border${Borders[i]}Color`] = props.borderTopColor;
                    changed = 1;
                }
                if (props[`border${Borders[i]}Width`] != props.borderTopWidth) {
                    props[`border${Borders[i]}Width`] = props.borderTopWidth;
                    changed = 1;
                }
                if (props[`border${Borders[i]}Style`] != props.borderTopStyle) {
                    props[`border${Borders[i]}Style`] = props.borderTopStyle;
                    changed = 1;
                }
            }
        }
        this.digest({
            mode: to
        });
        if (changed) {
            dispatch(this.root, 'change', {
                use: 'border',
            });
        }
    }
});