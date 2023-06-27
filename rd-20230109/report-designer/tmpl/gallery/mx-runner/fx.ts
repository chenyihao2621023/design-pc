import Magix from 'magix';
import Runner from './index';
let { Base, now } = Magix;
let alg = t => t * t;
export default Base.extend({
    ctor(duration, callback) {
        this['@:{alg.fn}'] = (from, to) => {
            return from + (to - from) * alg(this['@:{current.timespan}'] / duration);
        };
        this['@:{update}'] = () => {
            this['@:{current.timespan}'] = now() - this['@:{start.time}'];
            if (this['@:{current.timespan}'] > duration) {
                this['@:{current.timespan}'] = duration;
                this['@:{stop}']();
            }
            callback(this['@:{alg.fn}']);
        };
    },
    '@:{start}'() {
        if (!this['@:{working}']) {
            this['@:{working}'] = 1;
            this['@:{start.time}'] = now();
            Runner['@:{task.add}'](10, this['@:{update}']);
        }
    },
    '@:{stop}'() {
        if (this['@:{working}']) {
            this['@:{working}'] = 0;
            Runner['@:{task.remove}'](this['@:{update}']);
        }
    }
});