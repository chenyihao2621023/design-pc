/*
    author:https://github.com/xinglie
*/
import Magix, { delay } from 'magix5';
import Const from '../../designer/const';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import MapProvider from '../../provider/map';
let { State, View, mark, node } = Magix;
let triggerEvent = (element, map) => {
    let center = map.getCenter().wrap();
    let zoom = map.getZoom();
    let { props } = element;
    let changed = 0,
        p = {};
    if (props.lat != center.lat ||
        props.lng != center.lng) {
        props.lat = center.lat;
        props.lng = center.lng;
        changed = 1;
        p['@:{latlng}'] = 1;
    }
    if (props.zoom != zoom) {
        props.zoom = zoom;
        changed = 1;
        p['@:{zoom}'] = 1;
    }
    if (changed) {
        State.fire('@:{event#stage.select.element.props.change}', {
            '@:{ids}': {
                [element.id]: 1
            },
            '@:{types}': {
                [element.type]: 1
            },
            '@:{props}': p
        });
        let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
        DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename, '@:{elements.map.from.event}', Const['@:{const#hisotry.save.continous.delay}']);
    }
};
export default View.extend({
    tmpl: '@:dshow.html',
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
        let readonly = props.readonly;
        if (!this['@:{exception}']) {
            await this.digest({
                scale: State.get('@:{global#stage.scale}') || 1
            });
            let map = this['@:{map.instance}'];
            try {
                if (!map) {
                    await MapProvider();
                    if (m()) {
                        let containerNode = node<HTMLElement>(`map_${this.id}`);
                        let map = L.map(containerNode, {
                            zoom: props.zoom,
                            center: [props.lat, props.lng],
                            zoomAnimation: false,
                            zoomControl: !readonly,
                            dragging: !readonly,
                            doubleClickZoom: !readonly
                        });

                        this['@:{map.instance}'] = map;
                        this['@:{change.listener}'] = (e) => {
                            triggerEvent(this.get('element'), map);
                        };
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                        }).addTo(map);
                        map.addEventListener('zoomend', this['@:{change.listener}']);
                        map.addEventListener('moveend', this['@:{change.listener}']);

                        let tipNode = node<HTMLElement>(`tip_${this.id}`);
                        tipNode.remove();
                    }
                } else {
                    map.removeEventListener('zoomend', this['@:{change.listener}']);
                    map.removeEventListener('moveend', this['@:{change.listener}']);
                    map.setView({
                        lat: props.lat,
                        lng: props.lng
                    }, props.zoom);
                    map.invalidateSize(true);
                    let addMark = mark(this, '@:{add.mark}');
                    await delay(300);
                    if (addMark()) {
                        map.addEventListener('zoomend', this['@:{change.listener}']);
                        map.addEventListener('moveend', this['@:{change.listener}']);
                    }
                }
            } catch (ex) {
                this.digest({
                    error: this['@:{exception}'] = ex
                });
            }
        } else {
            this.digest({
                error: this['@:{exception}']
            });
        }
    },
    '@:{stop}<pointerdown,contextmenu>'(e: PointerEvent) {
        if (!e['@:{halt}']) {
            // let { target } = e;
            // if (target.id != `${this.id}_pv`) {
            e['@:{halt}'] = 1;
            let element = this.get('element');
            if (StageSelection["@:{selection#set}"](element)) {
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
            }
        }
        //}
    }
});