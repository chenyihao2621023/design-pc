import Magix from 'magix';
import GenericProvider from '../../provider/generic';
let { mix } = Magix;
let whites = {
    '127.0.0.1': 1,
    'localhost': 1
};
let key = `extra.rds`;
export default {
    '@:{get.config}'() {
        let config = {
            name: '',
            nc: 1,
            pt: 0,
            pl: 0,
            pr: 0,
            pb: 0,
            l: 'portrait',
            ts: false
        };
        let saved = GenericProvider['@:{generic#store.get}'](key);
        if (saved) {
            mix(config, JSON.parse(saved));
        }
        return config;
    },
    '@:{set.config}'(config) {
        GenericProvider['@:{generic#store.set}'](key, JSON.stringify(config));
    },
    '@:{format.ex.message}'(ex) {
        let host = location.hostname;//.split('.').slice(-2).join('.');
        if (!whites[host] &&
            !APPROVE) {
            return host + '环境不支持RDS服务，进一步了解详情可以添加作者微信：qq84685009';
        }
        return `RDS服务异常[${ex.message || ex}]`;
    }
};