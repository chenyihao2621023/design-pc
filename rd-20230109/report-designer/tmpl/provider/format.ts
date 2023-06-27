import Magix from 'magix5';
import Generic from './generic';
import I18n from '../i18n/index';
let { Cache, toNumber, isNumber } = Magix;
let { floor, ceil } = Math;
/*
    builtin:{"prefix":"$","type":"number","body":["#,###",".###"],"postfix":"x"}
    builtin:{prefix:'$',type:'date',body:['YYYY-DD-mm'],postfix:'x'}
    custom:function(x,y){}
*/
let groups = [{
    title: '内置',
    id: 'builtin',
    prefix: {
        title: '前缀',
        custom: 1,
        list: [{
            title: '人民币',
            example: '¥',
            format: '¥'
        }, {
            title: '美元',
            example: '$',
            format: '$'
        }, {
            title: '欧元',
            example: '€',
            format: '€'
        }, {
            title: '英磅',
            example: '￡',
            format: '￡'
        }, {
            title: '泰铢',
            example: '฿',
            format: '฿'
        }]
    },
    postfix: {
        title: '后缀',
        custom: 1,
        list: [{
            title: '千米',
            example: 'km',
            format: 'km'
        }, {
            title: '米',
            example: 'm',
            format: 'm'
        }, {
            title: '厘米',
            example: 'cm',
            format: 'cm'
        }, {
            title: '毫米',
            example: 'mm',
            format: 'mm'
        }, {
            title: '纳米',
            example: 'nm',
            format: 'nm'
        }, {
            title: '开尔文',
            example: 'K',
            format: 'K'
        }, {
            title: '摄氏度',
            example: '℃',
            format: '℃'
        }, {
            title: '百帕',
            example: 'HPa',
            format: 'HPa'
        }, {
            title: '千帕',
            example: 'KPa',
            format: 'KPa'
        }, {
            title: '兆帕',
            example: 'MPa',
            format: 'MPa'
        }, {
            title: '巴',
            example: 'bar',
            format: 'bar'
        }]
    },
    subs: [{
        title: '数字',
        id: 'number',
        parts: [{
            title: '整数',
            list: [{
                title: '千分位',
                format: '#,###',
                example: '1,000'
            }, {
                title: '万分位',
                format: '#,####',
                example: '1,0000'
            }, {
                title: '万分位',
                format: '#\'####',
                example: '1\'0000'
            }]
        }, {
            title: '小数',
            list: [{
                title: '无小数',
                format: '.',
                example: '0'
            }, {
                title: '一位小数',
                format: '.#',
                example: '0.1'
            }, {
                title: '两位小数',
                format: '.##',
                example: '0.01'
            }, {
                title: '三位小数',
                format: '.###',
                example: '0.001'
            }, {
                title: '四位小数',
                format: '.####',
                example: '0.0001'
            }]
        }]
    }, {
        title: '日期',
        id: 'date',
        parts: [{
            title: '格式',
            custom: 1,
            list: [{
                title: '年-月-日',
                format: 'YYYY-MM-DD',
                example: '2020-09-08'
            }, {
                title: '年/月/日',
                format: 'YYYY/MM/DD',
                example: '2020/09/08'
            }, {
                title: '年-月-日 时:分:秒',
                format: 'YYYY-MM-DD hh:mm:ss',
                example: '2020-09-08 20:00:05'
            }, {
                title: '年/月/日 时:分:秒',
                format: 'YYYY/MM/DD hh:mm:ss',
                example: '2020/09/08 20:00:05'
            }]
        }]
    }]
}, {
    title: '自定义',
    id: 'custom',
    defaults: `/*
    data是根据根据当前绑定的字段取到的数据
    item是完整的单条数据对象
    可以把下面的console前的注释去掉查看相应的数据
*/
function(data,item){
    //console.log(data,item);
    //return data+item.name;
    return data;
}`}];
let dateToken = /d{1,4}|D{1,4}|M{1,4}|YY(?:YY)?|([Hhsmw])\1?|[aA]/g;
let shorten = (source: string[], len = 3) => {
    let short = [];
    for (let e of source) {
        short.push(e.substring(0, len));
    }
    return short;
};
let dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let dateEnLangs = {
    '@:{date#day.names.short}': shorten(dayNames),
    '@:{date#day.names}': dayNames,
    '@:{date#month.names.short}': shorten(monthNames),
    '@:{date#month.names}': monthNames,
    '@:{date#am.pm.lower}': ['am', 'pm'],
    '@:{date#am.pm.upper}': ['AM', 'PM'],
}, dateZhLangs = {
    '@:{date#day.names.short}': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    '@:{date#day.names}': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    '@:{date#month.names.short}': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    '@:{date#month.names}': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    '@:{date#am.pm}': ['上午', '下午'],
};
let singleDayTime = 86400000;
let dateProcessor = {
    A(date, lang) {
        let am = lang['@:{date#am.pm.upper}'] || lang['@:{date#am.pm}'];
        return am[date.getHours() < 12 ? 0 : 1];
    },
    a(date, lang) {
        let am = lang['@:{date#am.pm.lower}'] || lang['@:{date#am.pm}'];
        return am[date.getHours() < 12 ? 0 : 1];
    },
    s(date) {
        return date.getSeconds();
    },
    ss(date) {
        return Generic['@:{generic#pad.start}'](this.s(date));
    },
    m(date) {
        return date.getMinutes();
    },
    mm(date) {
        return Generic['@:{generic#pad.start}'](this.m(date));
    },
    h(date) {
        let h = date.getHours();
        if (h > 12) {
            h -= 12;
        }
        return h;
    },
    hh(date) {
        return Generic['@:{generic#pad.start}'](this.h(date));
    },
    H(date) {
        return date.getHours();
    },
    HH(date) {
        return Generic['@:{generic#pad.start}'](this.H(date));
    },
    w(date) {
        let start = new Date(date.getFullYear(), 0, 1);
        let weekTime = start.getTime();
        let weekDay = start.getDay();
        let time = date.getTime();
        let weekNum = 0;
        if (weekDay === 0) {
            weekDay = 7;
        }
        if (weekDay > 4) {
            weekTime += (8 - weekDay) * singleDayTime;
        } else {
            weekTime += (1 - weekDay) * singleDayTime;
        };
        weekNum = floor((time - weekTime) / singleDayTime) + 1;
        weekNum = ceil(weekNum / 7);
        return weekNum;
    },
    ww(date) {
        return Generic['@:{generic#pad.start}'](this.w(date))
    },
    d(date) {
        return date.getDay()
    },
    dd(date) {
        return Generic['@:{generic#pad.start}'](this.d(date))
    },
    ddd(date, lang) {
        return lang['@:{date#day.names.short}'][this.d(date)];
    },
    dddd(date, lang) {
        return lang['@:{date#day.names}'][this.d(date)];
    },
    D(date) {
        return date.getDate();
    },
    DD(date) {
        return Generic['@:{generic#pad.start}'](this.D(date));
    },
    DDD(date) {
        let time = date.getTime(),
            start = new Date(date.getFullYear(), 0, 1).getTime();
        return floor((time - start) / singleDayTime) + 1;
    },
    DDDD(date) {
        return Generic['@:{generic#pad.start}'](this.DDD(date), 3);
    },
    M(date) {
        return date.getMonth() + 1;
    },
    MM(date) {
        return Generic['@:{generic#pad.start}'](this.M(date));
    },
    MMM(date, lang) {
        return lang['@:{date#month.names.short}'][this.M(date) - 1];
    },
    MMMM(date, lang) {
        return lang['@:{date#month.names}'][this.M(date) - 1];
    },
    YYYY(date) {
        return date.getFullYear();
    },
    YY(date) {
        return ('' + this.YY(date)).slice(-2);
    }
};
let dateParse = date => {
    if (date instanceof Date) {
        return date;
    } else {
        date = new Date(Date.parse(String(date).replace(/-/g, '/')));
    }
    if (date instanceof Date &&
        (date.toString() != "Invalid Date")) {
        return date;
    }
}
let numberGroup = (snum, len, spliter) => {
    let result = '';
    while (snum.length > len) {
        result = spliter + snum.slice(-len) + result;
        snum = snum.substring(0, snum.length - len);
    }
    if (snum) {
        result = snum + result;
    }
    return result;
};
let fnCache = new Cache();
let fnReg = /\bfunction\s*\(([\s\S]*?)\)\s*\{([\s\S]*?)\}\s*;?\s*$/i;
export default {
    '@:{get.groups}'() {
        return groups;
    },
    '@:{get.parts}'(format) {
        let returned;
        if (format == null) {
            returned = [];
        } else {
            let ci = format.indexOf(':');
            if (ci > -1) {
                let leader = format.substring(0, ci);
                let rest = format.substring(ci + 1);
                let result;
                if (leader == 'builtin') {
                    try {
                        result = JSON.parse(rest);
                    } catch {
                        result = {};
                    }
                } else {
                    result = rest;
                }
                return [leader, result];
            } else {
                returned = [];
            }
        }
        return returned;
    },
    '@:{translate}'(format) {
        let parts = this['@:{get.parts}'](format);
        let text = '';
        for (let g of groups) {
            if (g.id == parts[0]) {
                text = g.title + ':';
                if (g.id == 'custom') {
                    text += I18n('@:{lang#elements.fx}');
                } else {
                    let dest = parts[1];
                    if (dest?.prefix) {
                        text += `${g.prefix.title}(${dest.prefix})`;
                    }
                    if (dest?.type) {
                        for (let sub of g.subs) {
                            if (sub.id == dest.type) {
                                let output = '';
                                if (dest?.body) {
                                    let bd = dest.body,
                                        find;
                                    for (let i = 0; i < bd.length; i++) {
                                        let b = bd[i];
                                        let search = sub.parts[i].list;
                                        for (let d of search) {
                                            if (d.format == b) {
                                                output += d.title;
                                                find = 1;
                                                break;
                                            }
                                        }
                                    }
                                    if (!find) {
                                        output += I18n('@:{lang#custom}');
                                    }
                                }
                                if (output) {
                                    text += `${sub.title}(${output})`;
                                }
                                break;
                            }
                        }
                    }
                    if (dest?.postfix) {
                        text += `${g.postfix.title}(${dest.postfix})`;
                    }
                }
                break;
            }
        }
        return text;
    },
    '@:{format}'(format, data, ...exts) {
        format += '';
        let parts = this['@:{get.parts}'](format);
        let prefix = parts.shift();
        if (prefix == 'date@en' ||
            prefix == 'date@zh') {
            let date = dateParse(data);
            if (!date) {
                return data;
            }
            let f = parts[0];
            let en = prefix.endsWith('@en');
            f = f.replace(dateToken, m => {
                return dateProcessor[m]?.(date, en ? dateEnLangs : dateZhLangs) || m;
            });
            return f;
        } else if (prefix == 'builtin') {
            let dest = parts[0];
            let body = dest?.body ?? [];
            if (dest.type == 'number') {
                let num = toNumber(data);
                if (isNumber(num)) {
                    let d = body[1]?.length ?? 1;
                    let snum;
                    if (d) {
                        snum = num.toFixed(d - 1);
                    } else {
                        snum = num + '';
                    }
                    let dotIndex = snum.indexOf('.');
                    let rest = '';
                    if (dotIndex > 0) {
                        rest = snum.substring(dotIndex);
                        snum = snum.substring(0, dotIndex);
                    }
                    let integer = body[0];
                    if (integer) {
                        let len, char = ',';
                        let commaIndex = integer.lastIndexOf(char);
                        if (commaIndex == -1) {
                            char = '\'';
                            commaIndex = integer.lastIndexOf(char);
                        }
                        if (commaIndex != -1) {
                            let last = integer.substring(commaIndex + 1);
                            len = last.length;
                            snum = numberGroup(snum, len, char);
                        }
                    }
                    data = snum + rest;
                }
            } else if (dest.type == 'date') {
                let date = dateParse(data);
                if (date) {
                    let f = body[0] ?? '';
                    let en = prefix.endsWith('@en');
                    data = f.replace(dateToken, m => {
                        return dateProcessor[m]?.(date, en ? dateEnLangs : dateZhLangs) || m;
                    });
                }
            }
            if (dest.prefix) {
                data = dest.prefix + data;
            }
            if (dest.postfix) {
                data += dest.postfix;
            }
        } else if (prefix == 'custom') {
            let fn = parts.join('');
            let params, body;
            fn.replace(fnReg, (_, p, b) => {
                params = p;
                body = b;
            });
            if (params || body) {
                let key = [params, '\x00', body].join('');
                let fn = fnCache.get(key);
                if (!fn) {
                    fn = Function(params, body);
                    fnCache.set(key, fn);
                }
                try {
                    return fn(data, ...exts);
                } catch (ex) {
                    return ex.message;
                }
            } else {
                return data;
            }
        }
        return data;
    }
};