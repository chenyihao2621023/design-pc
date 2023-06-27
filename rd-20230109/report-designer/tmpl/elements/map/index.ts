/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import MapProvider from '../../provider/map';
let { View, mark, node } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.on('destroy', () => {
            let map = this['@:{map.instance}'];
            if (map) {
                map.remove();
            }
        })
    },
    assign(data) {
        this.set(data);
    },
    async render() {
        let m = mark(this, '@:{render}');
        let props = this.get('props');
        if (this['@:{exception}']) {
            this.digest({
                error: this['@:{exception}']
            });
        } else {
            await this.digest();
            let map = this['@:{map.instance}'];
            if (!map) {
                try {
                    await MapProvider();
                    if (m()) {
                        let containerNode = node<HTMLElement>(`map_${this.id}`);
                        let map = L.map(containerNode, {
                            zoom: props.zoom,
                            center: [props.lat, props.lng],
                            zoomControl: props.zoomCtrl,
                            dragging: props.dragging,
                            doubleClickZoom: props.doubleClickZoom
                        });
                        this['@:{map.instance}'] = map;
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                        }).addTo(map);
                        let tipNode = node<HTMLElement>(`tip_${this.id}`);
                        tipNode.remove();
                    }
                } catch (ex) {
                    this.digest({
                        error: this['@:{exception}'] = ex
                    });
                }
            }
        }
    }
});