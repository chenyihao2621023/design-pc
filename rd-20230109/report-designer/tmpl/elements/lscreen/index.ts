/**
 * 大屏管理插件
 */
import Const from '../../designer/const';
import Owner from '../index';
import LSBorderBG from './border-bg/designer';
import LSBorderCSS2 from './border-css2/designer';
import LSBorderCSS4 from './border-css4/designer';
import LSImage from './image/designer';
export default () => {
    let { resolve } = designer;
    Owner['@:{element.manager#register.layout}']({
        icon: '&#xe658;',
        title: '大屏',
        subs: [{
            ctrl: LSImage,
            image: resolve('../images/header_1_thumb.png'),
            title: '标题1',
            props() {
                return {
                    ename: '标题1',
                    image: resolve('../images/header_1.png'),
                    width: Const['@:{const#to.unit}'](1400),
                    height: Const['@:{const#to.unit}'](90)
                }
            }
        }, /*{
        ctrl: LSBorder,
        image: './images/border_1_thumb.png',
        title: '边框1',
        props() {
            return {
                ename: '边框1',
                image: 'url(./images/border_1.png) 35 52 35 52 fill',
                borderWidth: '35px 52px',
                width: Const['@:{const#to.unit}'](400),
                minWidth: Const['@:{const#to.unit}'](110),
                height: Const['@:{const#to.unit}'](200),
                minHeight: Const['@:{const#to.unit}'](70),
            };
        }
    },*/ {
            ctrl: LSBorderBG,
            image: resolve('../images/border_1_thumb.png'),
            title: '边框1',
            props() {
                return {
                    ename: '边框1',
                    image: resolve('../images/border_1.png'),
                    width: Const['@:{const#to.unit}'](400),
                    height: Const['@:{const#to.unit}'](200)
                };
            }
        }, {
            ctrl: LSImage,
            image: resolve('../images/header_2.png'),
            title: '标题2',
            props() {
                return {
                    ename: '标题2',
                    image: resolve('../images/header_2.png'),
                    width: Const['@:{const#to.unit}'](358),
                    height: Const['@:{const#to.unit}'](28)
                }
            }
        }, {
            ctrl: LSBorderCSS2,
            image: resolve('../images/border_2_thumb.png'),
            title: '边框2'
        }, {
            ctrl: LSImage,
            image: resolve('../images/header_3.png'),
            title: '标题3',
            props() {
                return {
                    ename: '标题3',
                    image: resolve('../images/header_3.png'),
                    width: Const['@:{const#to.unit}'](442),
                    height: Const['@:{const#to.unit}'](18)
                }
            }
        }, {
            ctrl: LSImage,
            image: resolve('../images/header_4_thumb.png'),
            title: '标题4',
            props() {
                return {
                    ename: '标题4',
                    image: resolve('../images/header_4.png'),
                    width: Const['@:{const#to.unit}'](960),
                    height: Const['@:{const#to.unit}'](53)
                }
            }
        }, {
            ctrl: LSBorderCSS4,
            image: resolve('../images/border_4_thumb.png'),
            title: '边框4'
        }]
    });
};