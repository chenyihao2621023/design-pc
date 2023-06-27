/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import GenericProvider from '../../provider/generic';
import IndexView from './index';
let { State, LOW } = Magix;
export default IndexView.extend({
    init() {
        let update = GenericProvider['@:{generic#debounce}'](e => {
            if (e['@:{changed.types}']['hod-footer']) {
                let props = this.get('props');
                this.digest({
                    props
                });
            }
        }, 30, this);
        State.on('@:{event#stage.header.footer.need.update}', update, LOW);
        this.on('destroy', () => {
            State.off('@:{event#stage.header.footer.need.update}', update, LOW);
        });
    },
});