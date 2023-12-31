/*
<--循环支持isLast isFirst-->
{{each list as value index isLast isFirst}}

{{/each}}

<--节点属性可以使用对象展开，展开操作可以使用*或...操作符-->
<div {{*attrs}} {{...attrs}}></div>

<--可以直接引用生成的虚拟节点-->
{{&virtualNodes}}

<--循环写法-->

{{each list as value}}
    <div>{{=value}}</div>
{{/each}}

or 

<div qk:each="{{list as value}}">{{=value}}</div>


{{forin list as value}}
    <div>{{=value}}</div>
{{/forin}}

or 

<div qk:forin="{{list as value}}">{{=value}}</div>


{{for(let i=0;i<10;i++)}}
    <div>{{=i}}</div>
{{/for}}

or 

<div qk:for="{{let i=;i<10;i++}}">{{=i}}</div>





*/
let htmlParser = require('./html-parser');
let tmplCmd = require('./tmpl-cmd');
let configs = require('./util-config');
let artExpr = require('./tmpl-art-ctrl');
let {
    quickDirectTagName,
    quickCommandTagName,
    quickCtrlTagName,
    quickCodeAttr,
    quickSpreadAttr,
    quickAutoAttr,
    quickOpenAttr,
    quickCloseAttr,
    quickEachAttr,
    quickElseIfAttr,
    quickForAttr,
    quickIfAttr,
    quickForInAttr,
    quickDeclareAttr,
    quickConditionReg,
    quickLoopReg,
    quickElseAttr,
    quickGroupObjectPrefix,
    tmplStoreIndexKey,
    tmplTempRealStaticKey,
    artCommandReg,
    tmplGroupTag,
    tmplGroupId,
    tmplGroupParentId,
    tmplCondPrefix,
    tmplGroupKeyAttr,
    tmplGroupUseAttr,
    tmplGroupHasOuterVariable,
    tmplVarTempKey,
    quickSourceArt,
    tmplMxViewParamKey,
    tmplGroupRootAttr,
    tmplStaticKey,
    tmplTempInlineStaticKey,
    tmplGlobalDataRoot,
    mxPrefix,
    tmplShortMX,
    quickNeedHostAttr
} = require('./util-const');
let utils = require('./util');
let regexp = require('./util-rcache');
let attrMap = require('./html-attrs');
let tmplUnescape = require('html-entities-decoder');
let md5 = require('./util-md5');
//let jsGeneric =require('./js-generic');
//let isMethodReg = /^\s*[a-zA-Z0-9$_]+\([\s\S]+?\)\s*$/;
let numString = /^(['"`])(-?[0-9]+(?:\.[0-9]+)?)\1$/;
let chalk = require('ansis');
//let jsGeneric = require('./js-generic');
let viewIdReg = /\x1f/g;
let artCtrlReg = /(?:<%'(\d+)\x11([^\x11]+)\x11'%>)?<%([#=:&])?([\s\S]+?)%>/g;
let inReg = /\(([\s\S]+?)\s*,\s*([^),]+),\s*([^),]+),\s*([^),]+),\s*(1|-1),\s*([a-zA-Z0-9\.\$\_]+)\)\s*in\s+([\S\s]+)/;
let mathcer = /<%([#=*]|\.{3})?([\s\S]*?)%>|$/g;
let escapeSlashRegExp = /[\\']/g;
let unescapeBreakReg = /\\n/g;
let tmplTagReusedKey = mxPrefix + '-key';
//let suffixReg = /\+'';\s*/g;
//let endReg = /;\s*$/;
//let condPlus = /\+''\+/g;
let tagHReg = /\x03\d+\x03/g;
let tmplCommandAnchorReg = /\x07\d+\x07/g;
let ifExtractReg = /^\s*(?:for|if)\s*\(([\s\S]+?)\)\s*;?\s*$/;
//let commaExprReg = /(?:,''\)|(%>'));/g;
let directReg = /\{\{&[\s\S]+?\}\}/g;
let ctrlReg = /\{\{\s*(break|continue);*\s*\}\}/g;
let spreadAttrsReg = /\{\{(?:\*|\.{3})[\s\S]+?\}\}/g;
let condPrefix = /^\x1c\d+\x1c/;
let tagReg = /<(\/?)([^>\s]+)[^>]*>/g;
let matchedTagReg = /(<([^>\s\/]+)[^>]*>)([^<>]*?)(<\/\2>)/g;
let lastCloseReg = />([^>]*)$/;
let condEscapeReg = /^((?:\x07\d+\x07)+\s*\\*?)\\\?/;
let inlineStaticHTMLReg = /\/\/#inline_static_html_node_ph_(\d+);\r\n/g;
let tmplFnParams = ['$encodeUrl', '$refData', '$keyOf', '$encodeQuote', '$isArray'];
let tmplRadioOrCheckboxKey = 'tmpl_radio_or_checkbox_names';
let longExpr = /[\.\[\]]/;
let spanceAndSemicolonReg = /\s*;*\s*$/;
let trimExtraElseReg = /else\s*\{\s*\}/g;
let slotReg = /\$slots\.([a-zA-Z0-9$_]+)/g;
let vnodeMathcer = /=(\$vnode_\d+)/;
//let singleTemplate = /`\$\{([^\{\}]+)\}`$/;
// let quoteMap = {
//     '\t': '\\t',
//     '&#13;': '\\r',
//     '&#10;': '\\n',
//     '&#9;': '\\t',
//     '&#xd;': '\\r',
//     '&#xa;': '\\n',
//     '&#x9;': '\\t',
//     '&#34;': '\\"',
//     '&quot;': '\\"',
//     '&#x22;': '\\"',
//     '&#39;': '\\\'',
//     '&#x27;': '\\\'',
//     '&apos;': '\\\'',
//     '&#92;': '\\\\',
//     '&#x5c;': '\\\\',
//     '&#96;': '\\\\`',
//     '&#x60;': '\\`'
// };
//let quoteReg = new RegExp('(?:' + Object.keys(quoteMap).join('|') + ')', 'g');
//console.log(quoteReg);
//let quoteReplacer = m => quoteMap[m];
let encodeSlashRegExp = s => s.replace(escapeSlashRegExp, '\\$&');

let dquoteReg = /"/g;
let encodeDQuote = str => str.replace(dquoteReg, '&#34;');
let attrEmptyText = /\$text\+?=(['"`])\s*\1/g;
let storeInnerMatchedTags = (tmpl, store) => {
    let idx = store[tmplStoreIndexKey] || 0;
    return tmpl.replace(matchedTagReg, (m, prefix, tag, content, suffix) => {
        let groups = [prefix, content, suffix];
        let returned = '';
        for (let g of groups) {
            let key = '\x03' + idx++ + '\x03';
            store[key] = {
                tag: g == prefix,
                src: g
            };
            returned += key;
        }
        store[tmplStoreIndexKey] = idx;
        return returned;
    });
};
let storeHTML = (tmpl, store) => {
    let idx = store[tmplStoreIndexKey] || 0;
    return tmpl.replace(tagReg, (m, closed, tag) => {
        let key = '\x03' + idx++ + '\x03';
        store[key] = {
            tag: closed ? false : true,
            special: tag == quickDirectTagName || tag == quickCommandTagName,
            src: m
        };
        store[tmplStoreIndexKey] = idx;
        return key;
    });
};
let canGenerateHTML = node => {
    if (node.tag == tmplGroupTag) {
        return false;
    }
    let hasTmplGroupTag = node.innerHasGroupTag;
    if (hasTmplGroupTag) {
        return false;
    }
    if (node.children.length > 1) {
        return true;
    }
    for (let e of node.children) {
        if (e.type == 1) {
            return true;
        }
    }
    return false;
};

let isChildOf = (sub, parent) => {
    if (sub.level > parent.level) {
        let pIndex = sub.path[parent.level];
        return pIndex == parent.index;
    }
    return false;
};
let isInGroupNode = (start, groups, loose) => {
    for (let g of groups) {
        if (isChildOf(start, g)) {
            if (loose) {
                return true;
            }
            if (!g.staticValue) {
                return true;
            }
        }
    }
    return false;
};
let findInnerUsedGroups = (start, groupsOfUsed, groupsOfDeclaredMap) => {
    let groups = [];
    for (let g of groupsOfUsed) {
        if (isChildOf(g, start)) {
            let dest = groupsOfDeclaredMap[g.groupUse];
            if (dest) {
                groups.push(dest);
            }
        }
    }
    return groups;
};

// let isVarName = str => {
//     if (str.trim() !== str) {
//         return false;
//     }

//     try {
//         new Function(str, 'var ' + str);
//     } catch (_) {
//         return false;
//     }

//     return true;
// };

let checkInFunctionSlot = (token, map, snippet, file) => {
    let start = token;
    while (start) {
        if (start.groupContextNode) {
            console.log(chalk.red('[MXC-Error(tmpl-quick)]'), chalk.gray(snippet), chalk.magenta(`use custom bind or sync expression in context slot fn="${start.groupContext}" at ${file}`));
        }
        start = map[start.pId];
    }
};
let toNumberString = s => {
    if (numString.test(s)) {
        let r = s.replace(numString, '$2');
        let fi = r.indexOf('.'),
            li = r.lastIndexOf('.'),
            fs = r.indexOf('-'),
            ls = r.lastIndexOf('-');
        if (fi == li &&
            fs == ls &&
            (r.length == 1 ||
                !r.startsWith('0'))) {
            let n, max,
                rest;
            if (r.startsWith('-')) {
                if (fi > -1) {
                    n = r.substring(0, fi);
                    max = Number.MIN_SAFE_INTEGER + 1;
                    rest = r.substring(fi);
                    if (BigInt(n) < max ||
                        rest.length > 14) {
                        return s;
                    }
                    return n + rest;
                } else {
                    max = Number.MIN_SAFE_INTEGER;
                    if (BigInt(r) < max) {
                        return r + 'n';
                    }
                    return r;
                }
            } else {
                if (fi > -1) {
                    n = r.substring(0, fi);
                    max = Number.MAX_SAFE_INTEGER - 1;
                    rest = r.substring(fi);
                    if (BigInt(n) <= max &&
                        rest.length < 16) {
                        return n + rest;
                    }
                    return s;
                } else {
                    max = Number.MAX_SAFE_INTEGER;
                    if (BigInt(r) <= max) {
                        return r;
                    }
                    return r + 'n';
                }
            }
        }
    }
    return s;
};
let findAllInnerGroups = (start,
    groupsOfUsed,
    groupsOfDeclared,
    groupsOfDeclaredMap,
    groupsOfIds,
    refGroups) => {
    if (refGroups.indexOf(start) == -1) {
        refGroups.push(start);
        let used = findInnerUsedGroups(start, groupsOfUsed, groupsOfDeclaredMap);
        for (let p of groupsOfDeclared) {
            if (p.groupParentId &&
                p.groupParentId == start.groupId) {
                used.push(p);
            }
        }
        for (let n of used) {
            findAllInnerGroups(n, groupsOfUsed, groupsOfDeclared, groupsOfDeclaredMap, groupsOfIds, refGroups);
        }
    }
};

let findParentHasMagixEvent = (current, key, map) => {
    let has = false, offset = 0;
    do {
        let p = map[current.pId];
        if (p) {
            if (p.hasMagixEvent &&
                p.magixEvents[key] === 1) {
                has = true;
                break;
            }
            current = p;
            if (p.tag != quickCommandTagName) {
                offset++;
            }
        } else {
            break;
        }
    } while (1);
    return { has, offset };
};
let extractArtAndCtrlFrom = tmpl => {
    let result = [];
    tmpl.replace(artCtrlReg, (match, line, art, operate, ctrl) => {
        art = art || '';
        art = art.replace(unescapeBreakReg, '\n');
        result.push({
            origin: match,
            line,
            operate,
            art,
            ctrl
        });
    });
    return result;
};
// let templatetLeftReg = /'\+/g;
// let templateRightReg = /\+'/g;
// let template = /`/g;
// let toTemplateString = input => {
//     console.log(input,jsGeneric.splitString(input));
//     if (input.includes(`'+`) ||
//         input.includes(`+'`)) {
//         input = input.replace(template, '')
//             .replace(templatetLeftReg, '${')
//             .replace(templateRightReg, '}');
//         if (input.startsWith(`'`)) {
//             input = input.substring(1);
//         } else {
//             input = '${' + input;
//         }
//         if (input.endsWith(`'`)) {
//             input = input.slice(0, -1);
//         } else {
//             input = input + '}';
//         }
//         return '`' + input + '`';
//     }
//     return input;
// };
// let toFn1 = (key, tmpl, fromAttr, e, inGroup) => {
//     //tmpl = tmpl.replace(/%>\s+<%/g, '%><%');
//     //console.log(tmpl);
//     let index = 0,
//         hasCtrl = false,
//         hasOut = false,
//         hasCmdOut = false,
//         source = `${key}='`,
//         snippet,
//         preArt = -1,
//         ctrlCount = 0,
//         hasSnippet = false,
//         hasCharSnippet = false,
//         setStart = false,
//         hasVarOut = false,
//         reg = regexp.get(`${regexp.escape(key)}\\+='';+`, 'g');
//     tmpl.replace(mathcer, (match, operate, content, offset) => {
//         snippet = attrMap.escapeSlashAndBreak(tmpl.substring(index, offset));
//         if (snippet) {
//             hasSnippet = hasSnippet || !content || !setStart;
//             hasCharSnippet = hasCharSnippet || !!snippet.trim();
//             hasOut = true;
//             if (preArt == index) {
//                 source += `'')+'`;
//             }
//         }
//         setStart = true;
//         //if (decode) {
//         //console.log(snippet, JSON.stringify(snippet));
//         snippet = tmplUnescape(snippet.replace(quoteReg, quoteReplacer));
//         //console.log(snippet);
//         //}
//         source += snippet;
//         index = offset + match.length;
//         let ctrl = tmpl.substring(index - match.length + 2 + (operate ? operate.length : 0), index - 2);
//         let artReg = /^'(\d+)\x11([^\x11]+)\x11'$/;
//         let artMatch = ctrl.match(artReg);
//         let art = '', line = -1;
//         ctrl = attrMap.escapeSlashAndBreak(ctrl);
//         if (artMatch) {
//             ctrl = '';
//             art = artMatch[2];
//             line = artMatch[1];
//         }
//         if (operate == '@' ||
//             operate == '#') {
//             hasOut = true;
//             hasCmdOut = true;
//             hasVarOut = true;
//             let idx = content.indexOf(',\x00xl\x00');
//             if (idx > -1) {
//                 let autoKey = content.substring(idx + 5);
//                 content = content.substring(0, idx);
//                 if (!inGroup) {
//                     //console.log(key);
//                     content += ',' + toTemplateString(key);
//                     //console.log(content);
//                 }
//             }
//             idx = ctrl.indexOf(',\x00xl\x00');
//             if (idx > -1) {
//                 let autoKey = ctrl.substring(idx + 5)
//                 ctrl = ctrl.substring(0, idx);
//                 if (!inGroup) {
//                     ctrl += ',' + autoKey;
//                 }
//             }
//             //console.log(JSON.stringify([ctrl, content]));
//             //console.log(JSON.stringify(content));
//             //let a = tmplCmd.extractRefContent(content);
//             //console.log(a);
//             //let out = `($refData[${a.key}]=${a.vars},${a.key})`;
//             //console.log(content);
//             let out = `$keyOf($refData,${content})`;
//             if (configs.debug) {
//                 if (preArt == offset) {
//                     source += `$__ctrl='<%${operate}${ctrl}%>',${out})+'`;
//                 } else {
//                     source += `'+($__ctrl='<%${operate}${ctrl}%>',${out})+'`;
//                 }
//             } else {
//                 source += `'+${out}+'`;
//             }
//         } else if (operate == '=') {
//             hasOut = true;
//             hasCmdOut = true;
//             hasVarOut = true;
//             let safe = ``;
//             // if ((!content.startsWith('$encodeQuote(') &&
//             //     !content.startsWith('$keyOf(') &&
//             //     !content.startsWith('$encodeUrl(') &&
//             //     !content.startsWith('$nullCheck(')) &&
//             //     content != '$viewId' &&
//             //     !isMethodReg.test(content)) {
//             //     safe = '$nullCheck';
//             // }
//             if (content.startsWith(e.uniqueId)) {
//                 content = content.replace(e.uniqueId, '');
//                 safe = '';
//             }
//             if (ctrl.startsWith(e.uniqueId)) {
//                 ctrl = ctrl.replace(e.uniqueId, '');
//             }

//             let out = `${safe}(${content})`;
//             if (configs.debug) {
//                 if (preArt == offset) {
//                     source += `$__ctrl='<%=${ctrl}%>',${out})+'`;
//                 } else {
//                     source += `'+($__ctrl='<%=${ctrl}%>',${out})+'`;
//                 }
//             } else {
//                 source += `'+${out}+'`;
//             }
//         } else if (operate == '*' ||
//             operate == '...') {
//             hasOut = true;
//             hasCmdOut = true;
//             hasVarOut = true;
//             if (configs.debug) {
//                 if (preArt == offset) {
//                     source += `$__ctrl='<%${operate}${ctrl}%>',${content})+'`;
//                 } else {
//                     source += `'+($__ctrl='<%${operate}${ctrl}%>',${content})+'`;
//                 }
//             } else {
//                 source += `'+${content}+'`;
//             }
//         } else if (content) {
//             if (line > -1) {
//                 //hasCtrl = false;//调试中的原始行号和原始语句不作为控制语句
//                 preArt = index;
//                 hasVarOut = true;
//                 source += `'+($__line=${line},$__art='{{${art}}}',`;
//             } else {
//                 hasCtrl = true;
//                 ctrlCount++;
//                 if (preArt == offset) {
//                     source += `'')+'`;
//                 }
//                 source += `';`;
//                 if (configs.debug) {
//                     source += `$__ctrl='<%${ctrl}%>';`;
//                 }
//                 source += `${content};${key}+='`;
//             }
//         }
//         return match;
//     });
//     source += `';`;
//     source = source
//         .replace(viewIdReg, `'+$viewId+'`)
//         .replace(reg, '');
//     reg = regexp.get(`^${regexp.escape(key)}=''\\+`);
//     source = source
//         .replace(reg, regexp.encode(key + '='))
//         .replace(suffixReg, ';')
//         .replace(condPlus, '+')
//         .replace(endReg, '');
//     if (configs.debug &&
//         fromAttr &&
//         !hasOut &&
//         ctrlCount == 1) {
//         source = source.replace(commaExprReg, '$1,') + ')';
//     }
//     if (ctrlCount > 1
//         && !hasOut) {//如果超出1条控制语句，即使没有输出，也要认为有输出
//         hasOut = true;
//     }
//     let trimmedPrefix = false;
//     if (!hasOut ||
//         !hasCtrl) {
//         reg = regexp.get(`^${regexp.escape(key)}=(?:'';+)?`);
//         source = source.replace(reg, '');
//         trimmedPrefix = true;
//     }
//     //console.log(source,key,tmpl);
//     //console.log(source, hasOut, hasSnippet, hasCharSnippet);
//     return {
//         source,
//         hasOut,
//         trimmedPrefix,
//         hasSnippet,
//         hasCharSnippet,
//         hasVarOut,
//         hasCmdOut,
//         hasCtrl
//     };
// };
let VAR = 1,
    STRING = 2,
    CTRL = 4,
    PARTIAL = 8;
let toFn = (key, tmpl, e, inGroup) => {
    //tmpl = tmpl.replace(/%>\s+<%/g, '%><%');
    //console.log(tmpl);
    let index = 0,
        hasCtrl = false,
        hasOut = false,
        hasCmdOut = false,
        snippet,
        preArt = -1,
        ctrlCount = 0,
        hasSnippet = false,
        hasCharSnippet = false,
        setStart = false,
        hasVarOut = false,
        reg = regexp.get(`${regexp.escape(key)}\\+='';+`, 'g');
    let outputs = [];
    let partials = [];
    let part = '';
    tmpl.replace(mathcer, (match, operate, content, offset) => {
        snippet = tmplUnescape(tmpl.substring(index, offset));
        snippet = attrMap.escapeBreak(tmplCmd.escapeStringChars(snippet));
        if (snippet) {
            hasSnippet = hasSnippet || !content || !setStart;
            hasCharSnippet = hasCharSnippet || !!snippet.trim();
            if (preArt == index) {
                partials.push({
                    type: VAR,
                    content: part + `'')`
                });
                part = '';
            }
            let ss = snippet.split(viewIdReg);
            let passed;
            for (let s of ss) {
                if (passed) {
                    partials.push({
                        type: VAR,
                        content: '$viewId'
                    });
                }
                if (s) {
                    partials.push({
                        type: STRING,
                        content: s
                    });
                }
                passed = 1;
            }
        }
        setStart = true;
        index = offset + match.length;
        let ctrl = tmpl.substring(index - match.length + 2 + (operate ? operate.length : 0), index - 2);
        let artReg = /^'(\d+)\x11([^\x11]+)\x11'$/;
        let artMatch = ctrl.match(artReg);
        let art = '', line = -1;
        ctrl = attrMap.escapeBreak(tmplCmd.escapeStringChars(ctrl));
        if (artMatch) {
            ctrl = '';
            art = artMatch[2];
            line = artMatch[1];
        }
        if (operate == '@' ||
            operate == '#') {
            let idx = content.indexOf(',\x00xl\x00');
            if (idx > -1) {
                let autoKey = content.substring(idx + 5);
                content = content.substring(0, idx);
                if (!inGroup) {
                    content += ',' + autoKey; //toTemplateString(autoKey);
                }
            }
            idx = ctrl.indexOf(',\x00xl\x00');
            if (idx > -1) {
                let autoKey = ctrl.substring(idx + 5)
                ctrl = ctrl.substring(0, idx);
                if (!inGroup) {
                    ctrl += ',' + autoKey;
                }
            }
            let out = `$keyOf($refData,${content})`;
            if (configs.debug) {
                if (preArt == offset) {
                    partials.push({
                        type: VAR,
                        content: part + `$__ctrl='<%${operate}${ctrl}%>',${out})`
                    });
                    part = '';
                } else {
                    partials.push({
                        content: `($__ctrl='<%${operate}${ctrl}%>',${out})`,
                        type: VAR
                    });
                }
            } else {
                partials.push({
                    content: out,
                    type: VAR
                });
            }
        } else if (operate == '=') {
            let safe = ``;
            if (content.startsWith(e.uniqueId)) {
                content = content.replace(e.uniqueId, '');
                safe = '';
            }
            if (ctrl.startsWith(e.uniqueId)) {
                ctrl = ctrl.replace(e.uniqueId, '');
            }
            let out = `${safe}(${content})`;
            if (configs.debug) {
                if (preArt == offset) {
                    partials.push({
                        content: part + `$__ctrl='<%=${ctrl}%>',${out})`,
                        type: VAR
                    });
                    part = '';
                } else {
                    partials.push({
                        content: `($__ctrl='<%=${ctrl}%>',${out})`,
                        type: VAR
                    });
                }
            } else {
                partials.push({
                    content: out,
                    type: VAR
                });
            }
        } else if (operate == '*' ||
            operate == '...') {
            if (configs.debug) {
                if (preArt == offset) {
                    partials.push({
                        content: part + `$__ctrl='<%${operate}${ctrl}%>',${content})`,
                        type: VAR
                    });
                    part = '';
                } else {
                    partials.push({
                        content: `($__ctrl='<%${operate}${ctrl}%>',${content})`,
                        type: VAR
                    });
                }
            } else {
                partials.push({
                    content,
                    type: VAR
                });
            }
        } else if (content) {
            if (line > -1) {
                //hasCtrl = false;//调试中的原始行号和原始语句不作为控制语句
                preArt = index;
                part = `($__line=${line},$__art='{{${art}}}',`;
            } else {
                if (partials.length) {
                    outputs.push({
                        type: PARTIAL,
                        subs: partials
                    });
                    partials = [];
                }
                if (preArt == offset) {
                    outputs.push({
                        type: CTRL,
                        content: part + `'')`
                    });
                    part = '';
                }
                if (configs.debug) {
                    outputs.push({
                        type: CTRL,
                        content: `$__ctrl='<%${ctrl}%>'`
                    });
                }
                outputs.push({
                    type: CTRL,
                    content,
                });
            }
        }
        return match;
    });
    if (partials.length) {
        outputs.push({
            type: PARTIAL,
            subs: partials
        });
    }
    let source = '';
    let ctrlOut,
        subsOut,
        position = 0;
    for (let one of outputs) {
        if (one.type == PARTIAL) {
            if (!subsOut) {
                subsOut = ++position;
            }
            if (ctrlOut) {
                source += `;${key}+=`;
            } else {
                source += `${key}=`;
            }
            let f = 0,
                index = 0,
                stringClosedAt;
            for (let s of one.subs) {
                hasOut = true;
                f |= s.type;
                if (s.type == STRING) {
                    stringClosedAt = index;
                } else {
                    hasCmdOut = true;
                    hasVarOut = true;
                }
                index++;
            }
            if (f == STRING) {
                source += '`';
                for (let s of one.subs) {
                    source += s.content;
                }
                source += '`';
            } else if (f == VAR) {
                let append;
                for (let s of one.subs) {
                    if (append) {
                        source += '+';
                    }
                    source += s.content;
                    append = 1;
                }
            } else {
                index = 0;
                let stringOpened,
                    varAppend;
                for (let s of one.subs) {
                    if (s.type == STRING) {
                        if (!stringOpened) {
                            if (varAppend) {
                                source += '+';
                            }
                            source += '`';
                            stringOpened = 1;
                        }
                        source += s.content;
                    } else {
                        if (index > stringClosedAt) {
                            source += `+${s.content}`;
                        } else if (!stringOpened) {
                            if (varAppend) {
                                source += `+`;
                            }
                            source += s.content;
                            varAppend = 1;
                        } else {
                            source += `\${${s.content}\}`;
                        }
                    }
                    if (index == stringClosedAt) {
                        source += '`';
                    }
                    index++;
                }
            }
        } else {
            ctrlCount++;
            hasCtrl = true;
            if (!ctrlOut) {
                ctrlOut = ++position;
            }
            if (source) {
                source += ';';
            }
            source += one.content;
        }
    }
    if (ctrlOut <
        subsOut) {
        source = `${key}=\`\`;${source}`;
    }
    //console.log(tmpl, source);
    //source = source.replace(singleTemplate, '$1');
    //console.log(source);
    // if (configs.debug &&
    //     fromAttr &&
    //     !hasOut &&
    //     ctrlCount == 1) {
    //     source = source.replace(commaExprReg, '$1,') + ')';
    // }
    if (ctrlCount > 1 &&
        !hasOut) {//如果超出1条控制语句，即使没有输出，也要认为有输出
        hasOut = true;
    }
    let trimmedPrefix = false;
    if (!hasOut ||
        !hasCtrl) {
        reg = regexp.get(`^${regexp.escape(key)}=`);
        source = source.replace(reg, '');
        trimmedPrefix = true;
    }
    return {
        source,
        hasOut,
        trimmedPrefix,
        hasSnippet,
        hasCharSnippet,
        hasVarOut,
        hasCmdOut,
        hasCtrl
    };
};
let serAttrs = (key, value, e, inGroup) => {
    if (value === true ||
        value === false) {
        return {
            hasOut: true,
            direct: true,
            returned: value
        };
    }
    let { source,
        hasCtrl,
        hasOut,
        hasSnippet,
        hasCharSnippet,
        hasCmdOut,
        hasVarOut,
        trimmedPrefix } = toFn(key, value, e, inGroup);
    if (hasCtrl && hasOut) {
        return {
            trimmedPrefix,
            direct: false,
            hasCmdOut,
            hasCharSnippet,
            returned: source,
            hasSnippet,
            hasVarOut
        };
    } else {
        return {
            trimmedPrefix,
            direct: true,
            hasCtrl,
            hasCmdOut,
            hasCharSnippet,
            returned: source,
            hasVarOut
        };
    }
};
let getForContent = (cnt, e) => {
    let fi = extractArtAndCtrlFrom(cnt);
    if (fi.length != 1) {
        throw new Error('[MXC-Error(tmpl-quick)] bad loop ' + cnt + ' at ' + e.shortHTMLFile);
    }
    fi = fi[0];
    let m = fi.ctrl.match(inReg);
    if (m) {
        return {
            art: fi.art,
            line: fi.line,
            first: m[3],
            last: m[4],
            value: m[1],
            list: m[7],
            key: m[2],
            asc: m[5] == 1,
            step: m[6]
        };
    }
    throw new Error('[MXC-Error(tmpl-quick)] bad loop ' + cnt + ' at ' + e.shortHTMLFile);
};
let getIfContent = (cnt, e) => {
    let fi = extractArtAndCtrlFrom(cnt);
    //console.log(fi);
    if (fi.length > 1 || fi.length < 1) {
        throw new Error('[MXC-Error(tmpl-quick)] bad if ' + cnt + ' at ' + e.shortHTMLFile);
    }
    fi = fi[0];
    let m = fi.ctrl.match(ifExtractReg);
    if (m) {
        return {
            art: fi.art,
            line: fi.line,
            value: m[1]
        };
    }
    //console.log(m,fi);
    throw new Error('[MXC-Error(tmpl-quick)] bad if ' + cnt + ' at ' + e.shortHTMLFile);
};
let parser = (tmpl, e) => {
    //console.log('parser', tmpl);
    let cmds = Object.create(null);
    let map = Object.create(null);
    let idCounter = 0;
    let groupDeclared = [];
    let groupUsed = [];

    tmpl = tmplCmd.store(tmpl, cmds);
    //console.log(tmpl);
    let current = {
        id: 'qk' + idCounter++,
        level: 0,
        index: 0,
        path: [0],
        children: []
    };
    let stack = [current],
        textareaCount = 0;
    htmlParser(tmpl, {
        start(tag, {
            attrs,
            unary,
            start,
            end,
            attrsMap
        }) {
            let token = {
                id: 'qk' + idCounter++,
                pId: current.id,
                level: current.level + 1,
                tag,
                type: 1,
                ctrls: [],
                children: [],
                magixEvents: {},
                contentStart: end
            };
            if (tag == tmplGroupTag) {
                let pNode = map[token.pId];
                while (pNode) {
                    pNode.innerHasGroupTag = true;
                    pNode = map[pNode.pId];
                }
            }
            map[token.id] = token;
            if (textareaCount) {
                token.start = start;
            }
            if (tag == 'textarea') {
                textareaCount++;
            }
            let aList = [],
                auto = false;
            for (let a of attrs) {
                if (a.name == quickCodeAttr) {
                    let t = tmplCmd.recover(a.value, cmds);
                    if (tag == quickDirectTagName) {
                        let fi = extractArtAndCtrlFrom(t);
                        if (fi.length > 1 || fi.length < 1) {
                            throw new Error('[MXC-Error(tmpl-quick)] bad direct tag ' + t + ' at ' + e.shortHTMLFile);
                        }
                        fi = fi[0];
                        token.directArt = fi.art;
                        token.directLine = fi.line;
                        token.directCtrl = fi.ctrl;
                    } else if (quickCtrlTagName) {
                        token.isCtrlNode = true;
                        token.ctrl = t;
                    } else {
                        throw new Error(`[MXC-Error(tmpl-quick)] bad code tag ${t} at ${e.shortHTMLFile}`);
                    }
                } else if (a.name == quickAutoAttr) {
                    auto = true;
                } else if (a.name == quickEachAttr ||
                    a.name == quickForInAttr) {
                    let t = tmplCmd.recover(a.value, cmds);
                    let fi = getForContent(t, e);
                    token.ctrls.push({
                        type: a.name == quickEachAttr ? 'each' : 'forin',
                        line: fi.line,
                        art: fi.art,
                        first: fi.first,
                        last: fi.last,
                        key: fi.key,
                        value: fi.value,
                        list: fi.list,
                        asc: fi.asc,
                        step: fi.step
                    });
                    token.hasCtrls = true;
                } else if (a.name == quickIfAttr ||
                    a.name == quickElseIfAttr) {
                    let t = tmplCmd.recover(a.value, cmds);
                    let fi = getIfContent(t, e);
                    token.ctrls.push({
                        type: a.name == quickIfAttr ? 'if' : 'elif',
                        line: fi.line,
                        art: fi.art,
                        cond: fi.value
                    });
                    token.hasCtrls = true;
                } else if (a.name == quickElseAttr) {
                    token.ctrls.push({
                        type: 'else'
                    });
                    token.hasCtrls = true;
                } else if (a.name == quickForAttr) {
                    let t = tmplCmd.recover(a.value, cmds);
                    let fi = extractArtAndCtrlFrom(t);
                    if (fi.length > 1 || fi.length < 1) {
                        throw new Error('[MXC-Error(tmpl-quick)] bad for ' + t + ' at ' + e.shortHTMLFile);
                    }
                    fi = fi[0];
                    token.ctrls.push({
                        type: 'for',
                        line: fi.line,
                        art: fi.art,
                        cond: fi.ctrl.replace(ifExtractReg, '$1')
                    });
                    token.hasCtrls = true;
                } else if (a.name == tmplTempRealStaticKey) {
                    let p = stack[stack.length - 1];
                    //console.log(p);
                    if (!p ||
                        !p.groupKeyNode ||
                        !p.staticValue) {
                        token.canHoisting = true;
                        token.staticValue = a.value;
                    }
                    aList.push({
                        name: tmplStaticKey,
                        value: a.value,
                        unary: false
                    });
                } else if (a.name == quickNeedHostAttr) {
                    token.needHost = true;
                } else if (a.name == tmplTempInlineStaticKey) {
                    token.inlineStaticValue = a.value;
                } else if (a.name == 'mx-lazycreate' ||
                    a.name == mxPrefix + '-lazycreate') {
                    token.lazyCreate = true;
                } else if (a.name == tmplGroupKeyAttr) {
                    token.groupKey = utils.camSafeVar(a.value);
                    token.groupKeyNode = tag == tmplGroupTag;
                } else if (a.name == tmplGroupUseAttr) {
                    tmplCommandAnchorReg.lastIndex = 0;
                    if (tmplCommandAnchorReg.test(a.value)) {
                        //console.log(chalk.red(`[MXC-Error(tmpl-quick)] <mx-slot use/> can not use variable name. use {{& slot }} instead`), chalk.magenta('at file ' + e.shortHTMLFile));
                        tmplCommandAnchorReg.lastIndex = 0;
                        let t = tmplCmd.recover(a.value, cmds);
                        let fi = extractArtAndCtrlFrom(t);
                        if (fi.length > 1 || fi.length < 1) {
                            throw new Error('[MXC-Error(tmpl-quick)] bad <mx-slot use/> ' + t + ' at ' + e.shortHTMLFile);
                        }
                        token.tag = quickDirectTagName;
                        fi = fi[0];
                        token.directArt = fi.art;
                        token.directLine = fi.line;
                        token.directCtrl = fi.ctrl;
                    } else {
                        token.groupUse = utils.camSafeVar(a.value);
                        token.groupUseNode = tag == tmplGroupTag;
                    }
                } else if (a.name == tmplGroupId) {
                    token.groupId = a.value;
                } else if (a.name == tmplGroupParentId) {
                    token.groupParentId = a.value;
                } else if (a.name == 'fn' ||
                    a.name == 'params') {
                    token.groupContextNode = tag == tmplGroupTag;
                    token.groupContext = a.value || '';
                } else if (a.name == tmplGroupHasOuterVariable) {
                    token.groupContextHasOuterVar = true;
                } else if (a.name == tmplGroupRootAttr) {
                    token.groupRootRefs = a.value;
                } else if (a.name != quickDeclareAttr &&
                    a.name != quickSourceArt &&
                    a.name != quickOpenAttr &&
                    !a.name.startsWith(tmplCondPrefix)) {
                    let ignoreAttr = false;
                    if (a.name == 'type' &&
                        !a.unary &&
                        tag == 'input') {
                        token.inputType = a.value;
                    } else if (condPrefix.test(a.name)) {
                        let cond = '';
                        a.name = a.name.replace(condPrefix, m => {
                            cond = m;
                            return '';
                        });
                        let oCond = attrsMap[`${tmplCondPrefix}${cond}`];
                        let extract = tmplCmd.extractCmdContent(oCond, cmds);
                        let isRef = extract.operate == '#';
                        let refVar;
                        if (isRef) {
                            let ref = tmplCmd.extractRefContent(extract.content);
                            refVar = ref.vars;
                        }
                        let refCond = e.tmplConditionAttrs[cond];
                        let composer = {
                            value: `{{${isRef ? '#' : '='}${extract.content}}}${refCond.valuable ? '??' : '?'}`,
                            hasExt: refCond.hasExt,
                            condContent: extract.content,
                            isRef,
                            refVar,
                            boolean: refCond.boolean,
                            valuable: refCond.valuable,
                            art: extract.art,
                            line: extract.line,
                            origin: extract.origin
                        };
                        a.cond = composer;
                    }

                    tmplCommandAnchorReg.lastIndex = 0;
                    if (tmplCommandAnchorReg.test(a.name)) {
                        let src = tmplCmd.recover(a.name, cmds);
                        let { line, art } = artExpr.extractCmdToArt(src);
                        console.log(chalk.red(`[MXC-Error(tmpl-quick)] unsupport attr: ${art} at line ${line} at file: ${e.shortHTMLFile}`));
                        continue;
                    }

                    if (a.name == 'mx-updateby' &&
                        !a.unary) {
                        token.updateByKeys = a.value;
                        ignoreAttr = true;
                    } else if (a.name == 'mx-bindexpr') {
                        token.customBindExpr = true;
                    } else if (a.name == 'mx-bindto' ||
                        a.name == 'mx-bindfrom' ||
                        a.name == 'mx-syncto' ||
                        a.name == 'mx-syncfrom') {
                        token.customHost = true;
                    } else if (a.name == 'mx-syncexpr') {
                        token.customBindExpr = true;
                    } else if (a.name == 'mx-forexpr' ||
                        a.name == 'mx-forbind') {
                        token.customBindForExpr = true;
                    } else if (a.name == 'mx-owner' ||
                        a.name == mxPrefix + '-owner') {
                        token.hasMxOwner = true;
                    } else if (a.name == 'mx-host' ||
                        a.name == mxPrefix + 'host') {
                        token.bindHost = true;
                    } else if (a.name == 'mx-view' ||
                        a.name == 'mx5-view') {
                        token.isMxView = true;
                    } else if (!a.unary &&
                        (a.name.startsWith('mx-') ||
                            a.name.startsWith(mxPrefix)) &&
                        a.value.startsWith('\x1f')) {
                        let i = a.name.indexOf('-');
                        let e = a.name.substring(i + 1);
                        token.hasMagixEvent = true;
                        token.magixEvents[e] = 1;
                    } else if (!a.unary && (a.name == 'x-html' ||
                        a.name == 'inner-html' ||
                        a.name == 'mx-html' ||
                        a.name == mxPrefix + '-html' ||
                        a.name == 'mx-safe-html' ||
                        a.name == mxPrefix + '-safe-html')) {
                        token.hasXHTML = true;
                        token.xHTML = a.value;
                        token.isSafe = a.name == 'mx-safe-html' ||
                            a.name == mxPrefix + '-safe-html';
                        if (a.cond) {
                            token.cond = a.cond;
                        }
                        ignoreAttr = true;
                    } else if (a.name == 'mx-key' ||
                        a.name == mxPrefix + '-key') {
                        ignoreAttr = true;
                        token.mxKeyAttr = a;
                    } else if (a.name == 'mx-ctrl' ||
                        a.name == mxPrefix + 'ctrl') {
                        token.syncFromUI = true;
                    } else if (!a.unary &&
                        a.value.startsWith('\x07')) {
                        a.value = a.value.replace(condEscapeReg, '$1?');
                    } else if (!a.unary &&
                        a.value.includes('\x1f')) {
                        token.attrHasDynamicViewId = true;
                        token.canHoisting = false;
                    } else if (a.name == 'mx-ref' ||
                        a.name == mxPrefix + '-ref') {
                        token.hasMxRef = true;
                    } else if (a.name == tmplMxViewParamKey) {
                        ignoreAttr = true;
                        token.mxViewParamValue = a;
                    }
                    if (!ignoreAttr) {
                        if (!a.unary) {
                            a.value = encodeDQuote(tmplUnescape(a.value));
                        }
                        aList.push(a);
                    }
                }
            }
            let index = current.children.length;
            token.path = [...current.path, index];
            token.index = index;
            if (token.isMxView) {
                //let addFromOrTo = false;
                if (token.isMxView &&
                    configs.tmplSupportSlot) {
                    let inLooseGroup = isInGroupNode(token, groupDeclared.concat(groupUsed), true);
                    //addFromOrTo = true;
                    token.hasFromOrTo = true;
                    token.attrHasDynamicViewId = true;
                    if (inLooseGroup) {
                        aList.unshift({
                            name: 'mx-main',//mx-to
                            value: '\x05',
                            unary: false
                        });
                    } else {
                        aList.unshift({
                            name: 'mx-main',//from
                            value: '\x1f',
                            unary: false
                        });
                    }
                }
                if (token.isMxView &&
                    //!addFromOrTo &&
                    !token.hasMxOwner) {
                    token.hasMxOwner = true;
                    token.attrHasDynamicViewId = true;
                    aList.unshift({
                        name: 'mx-owner',
                        value: '\x1f',
                        unary: false
                    });
                }
            }
            if ((token.customBindExpr ||
                token.syncFromUI ||
                token.needHost ||
                token.hasMxRef) && (
                    !token.bindHost &&
                    !token.customHost
                )) {
                token.attrHasDynamicViewId = true;
                aList.unshift({
                    name: 'mx-host',
                    value: '\x1f',
                    unary: false
                });
            }
            if (token.mxKeyAttr) {
                aList.unshift(token.mxKeyAttr);
            }
            if (token.mxViewParamValue) {
                aList.unshift(token.mxViewParamValue);
            }
            if (configs.tmplSupportSlotFn &&
                token.needHost &&
                !token.customHost) {
                checkInFunctionSlot(token, map, tmpl.slice(start, end), e.shortHTMLFile);
            }
            //console.log(token, aList);
            token.attrs = aList;
            token.unary = unary;
            token.auto = auto;
            //let prev = current.children[current.children.length - 1];
            // we can exchange tag here
            // if (token.tag == 'input' && prev && prev.tag == 'span') {
            //     current.children.pop();
            //     current.children.push(token, prev);
            // } else {
            current.children.push(token);
            //}
            if (!unary) {
                stack.push(token);
                current = token;
            }
            if (token.groupKeyNode) {
                groupDeclared.push(token);
            } else if (token.groupUseNode) {
                groupUsed.push(token);
            }
            if (token.isMxView) {
                let start = token;
                do {
                    start = map[start.pId];
                    if (start &&
                        start.isMxView &&
                        !start.addedMxSub) {
                        start.addedMxSub = true;
                        start.attrs.unshift({
                            name: 'mx-nest',
                            unary: true,
                            value: true
                        });
                    }
                } while (start);
            }
        },
        end(tag, { start, end }) {
            let em = stack.pop();
            if (tag == 'textarea') {
                textareaCount--;
                let { children } = em;
                em.children = [];
                //e.unary = true;
                let value = '';
                for (let c of children) {
                    value += c.content;
                }
                value = value.trim();
                em.attrs.push({
                    name: 'value',
                    value,
                });
            }

            if (textareaCount) {
                em.content = tmpl.slice(em.start, end);
            }
            if (em.contentStart >= 0) {
                em.innerHTML = tmpl.slice(em.contentStart, start);
                delete em.contentStart;
            }
            if (em.hasXHTML) {
                let oldChildren = em.children;
                if (em.cond) {
                    let tag = `mx-${em.isSafe ? 'safe-' : ''}html`;
                    if (!em.cond.valuable) {
                        console.log(chalk.red(`[MXC-Error(tmpl-quick)] ${tag} unsupport boolean condition: ${em.cond.value}${em.cond.line != null ? ` at line: ${em.cond.line}` : ''}`), ' at file', chalk.gray(e.shortHTMLFile));
                        throw new Error(`[MXC-Error(tmpl-quick)] ${tag} unsupport boolean condition at ${e.shortHTMLFile}`);
                    }
                    let { condContent,
                        hasExt, valuable,
                        art, line, isRef, refVar } = em.cond;
                    let xHTML = valuable ? hasExt || `<%${art}%>` : hasExt;
                    if (isRef) {
                        condContent = refVar;
                    }
                    em.children = [{
                        attrs: [],
                        id: 'qk' + idCounter++,
                        pId: current.id,
                        hasCtrls: true,
                        ctrls: [{
                            art: art,
                            cond: valuable ? `(${condContent})!=null` : condContent,
                            line: line,
                            type: "if",
                        }],
                        tag: quickCommandTagName,
                        auto: true,
                        children: [{
                            type: 3,
                            isXHTML: true,
                            isSafe: em.isSafe,
                            content: xHTML
                        }]
                    }];
                    if (oldChildren.length) {
                        em.children.push({
                            attrs: [],
                            id: 'qk' + idCounter++,
                            pId: current.id,
                            hasCtrls: true,
                            ctrls: [{
                                type: "else",
                            }],
                            tag: quickCommandTagName,
                            auto: true,
                            children: oldChildren
                        });
                    }
                } else {
                    em.children = [{
                        type: 3,
                        isXHTML: true,
                        isSafe: em.isSafe,
                        content: em.xHTML
                    }];
                }

            }
            current = stack[stack.length - 1];
        },
        chars(text) {
            if (text.trim()) {
                let token = {
                    type: 3,
                    content: text
                };
                let index = current.children.length;
                token.path = [...current.path, index];
                token.index = index;
                current.children.push(token);
            }
        }
    });
    return {
        tokens: current.children,
        groupDeclared,
        groupUsed,
        cmds,
        tmpl,
        map
    };
};
let Directives = {
    'if'(ctrl, start, end, auto) {
        if (configs.debug) {
            let open = auto ? '{{if ' : quickIfAttr + '="{{';
            let art = `${open}${ctrl.art}}}${auto ? '' : '"'}`;
            start.push(`$__line=${ctrl.line};$__art=${JSON.stringify(art)};`);
            start.push(`$__ctrl=${JSON.stringify('if(' + ctrl.cond + '){')};`);
        }
        start.push(`\r\nif(${ctrl.cond}){\r\n`);
        end.push('\r\n}');
    },
    'elif'(ctrl, start, end, auto) {
        start.push(`else if(`);
        if (configs.debug) {
            let open = auto ? '{{else if ' : quickElseIfAttr + '="{{';
            let art = `${open}${ctrl.art}}}${auto ? '' : '"'}`;
            start.push(`($__line=${ctrl.line},$__art=${JSON.stringify(art)},`);
            start.push(`$__ctrl=${JSON.stringify('else if(' + ctrl.cond + '){')}),`);
        }
        start.push(ctrl.cond, '){\r\n');
        end.push('\r\n}');
    },
    'else'(ctrl, start, end) {
        start.push(`else{\r\n`);
        end.push('\r\n}');
    },
    'each'(ctrl, start, end, auto) {
        let shortList = utils.uId('$q_a_', '', 1);
        let listCount = utils.uId('$q_c_', '', 1);
        //console.log(ctrl);
        let decs = `let ${shortList}=${ctrl.list},`;
        if (!longExpr.test(ctrl.list)) {
            decs = 'let ';
            shortList = ctrl.list;
        }
        let initial = ctrl.value.startsWith('$q_v_') ? '' : `let ${ctrl.value}=${shortList}[${ctrl.key}];`;
        if (ctrl.asc) {
            decs += `${listCount}=${shortList}?.length`;
            if (ctrl.first != -1) {
                initial += `let ${ctrl.first}=${ctrl.key}===0;`;
            }
            if (ctrl.last != -1) {
                let last = utils.uId('$q_lc_', '', 1);
                decs += `,${last}=${listCount}-1`;
                initial += `let ${ctrl.last}=${ctrl.key}===${last};`;
            }
            decs += `,${ctrl.key}=0`;
        } else {
            decs += `${ctrl.key}=${shortList}?.length`;
            if (ctrl.first != -1 ||
                ctrl.last != -1 ||
                ctrl.step != 1) {
                decs += '-1';
            }
            if (ctrl.first != -1) {
                let last = utils.uId('$q_lc_', '', 1);
                decs += `,${last}=${ctrl.key}`;
                initial += `let ${ctrl.first}=${ctrl.key}===${last};`;
            }
            if (ctrl.last != -1) {
                initial += `let ${ctrl.last}=${ctrl.key}===0;`;
            }
        }
        if (configs.debug) {
            let open = auto ? '{{each ' : quickEachAttr + '="{{';
            let art = `${open}${ctrl.art}}}${auto ? '' : '"'}`;
            start.push(`$__line=${ctrl.line};$__art=${JSON.stringify(art)};`);
            if (ctrl.asc) {
                start.push(`$__ctrl=${JSON.stringify(`for(${decs};${ctrl.key}<${listCount};${ctrl.key}+=${ctrl.step}){${initial}`)};`);
            } else {
                start.push(`$__ctrl=${JSON.stringify(`for(${decs};${ctrl.key}>=0;${ctrl.key}-=${ctrl.step}){${initial}`)};`);
            }
        }
        //console.log(decs);
        if (ctrl.asc) {
            start.push(`\r\nfor(${decs};${ctrl.key}<${listCount};${ctrl.key}+=${ctrl.step}){\r\n${initial}\r\n`);
        } else {
            if (ctrl.step == 1 &&
                ctrl.first == -1 &&
                ctrl.last == -1) {
                start.push(`\r\nfor(${decs};${ctrl.key}--;){\r\n${initial}\r\n`);
            } else {
                start.push(`\r\nfor(${decs};${ctrl.key}>=0;${ctrl.key}-=${ctrl.step}){\r\n${initial}\r\n`);
            }
        }
        end.push('\r\n}');
    },
    'forin'(ctrl, start, end, auto) {
        let initial = ctrl.value.startsWith('$q_v_') ? '' : `let ${ctrl.value}=${ctrl.list}[${ctrl.key}];`;
        if (configs.debug) {
            let open = auto ? '{{forin ' : quickForInAttr + '="{{'
            let art = `${open}${ctrl.art}}}${auto ? '' : '"'}`;
            start.push(`$__line=${ctrl.line};$__art=${JSON.stringify(art)};`);
            start.push(`$__ctrl=${JSON.stringify(`for(let ${ctrl.key} in ${ctrl.list}){${initial}`)};`);
        }
        start.push(`\r\nfor(let ${ctrl.key} in ${ctrl.list}){\r\n${initial}\r\n`);
        end.push('\r\n}');
    },
    'for'(ctrl, start, end, auto) {
        if (configs.debug) {
            let open = auto ? '{{for ' : quickForAttr + '="{{'
            let art = `${open}${ctrl.art}}}${auto ? '' : '"'}`;
            start.push(`$__line=${ctrl.line};$__art=${JSON.stringify(art)};`);
            start.push(`$__ctrl=${JSON.stringify(`for(${ctrl.cond}){`)};`);
        }
        start.push(`\r\nfor(${ctrl.cond}){\r\n`);
        end.push('\r\n}');
    }
};
let preProcess = (src, e) => {
    //console.log('enter',JSON.stringify(src));
    let cmds = Object.create(null),
        tags = Object.create(null);
    src = src.replace(directReg, m => {
        return `<${quickDirectTagName} ${quickCodeAttr}="${m}"/>`;
    }).replace(spreadAttrsReg, m => {
        return `${quickSpreadAttr}="${m}"`;
    }).replace(ctrlReg, (m, $1) => {
        return `<${quickCtrlTagName} ${quickCodeAttr}="${$1}"/>`;
    });
    //console.log(src);
    src = artExpr.addLine(src);
    src = tmplCmd.store(src, cmds);
    src = tmplCmd.store(src, cmds, artCommandReg);
    let count = 0;
    //console.log(src);
    //以上处理模板命令，然后是合法的html标签
    /*
        我们要区别对待
        1.
         <div>
            a
                {{if cond}}
                    b
                {{/if}}
            c
         </div>
        2.
         <div>
            {{if cond}}
                <div>cond</div>
            {{/if}}
         </div>
        
        在文本中的命令语句与在标签中的命令语句处理不同，所以要先把最内部的处理下
    */
    src = storeInnerMatchedTags(src, tags);
    src = storeHTML(src, tags);
    src = src.replace(tmplCommandAnchorReg, m => {
        let ref = cmds[m];
        if (ref) {
            let i = artExpr.extractArtInfo(ref);
            //console.log(ref,i)
            if (i) {
                let { art, ctrls, line } = i;
                let sourceArt = ` ${quickSourceArt}="${attrMap.escapeAttr(art)}"`;
                if (ctrls[0] == 'each') {
                    return `<${quickCommandTagName}${sourceArt} ${quickAutoAttr} ${quickOpenAttr}="<%{%>" ${quickEachAttr}="{{\x1e${line} ${art.substring(5)}}}">`;
                } else if (ctrls[0] == 'forin') {
                    return `<${quickCommandTagName}${sourceArt} ${quickAutoAttr} ${quickOpenAttr}="<%{%>" ${quickForInAttr}="{{\x1e${line} ${art.substring(6)}}}">`;
                } else if (ctrls[0] == 'for') {
                    return `<${quickCommandTagName}${sourceArt} ${quickAutoAttr} ${quickOpenAttr}="<%{%>" ${quickForAttr}="{{\x1e${line} ${art.substring(4)}}}">`;
                } else if (ctrls[0] == 'if') {
                    return `<${quickCommandTagName}${sourceArt} ${quickAutoAttr} ${quickOpenAttr}="<%{%>" ${quickIfAttr}="{{\x1e${line} ${art.substring(3)}}}">`;
                } else if (ctrls[0] == 'else') {
                    if (ctrls[1] == 'if') {
                        return `</${quickCommandTagName} ${quickCloseAttr}="<%}%>"><${quickCommandTagName}${sourceArt} ${quickAutoAttr} ${quickOpenAttr}="<%{%>" ${quickElseIfAttr}="{{\x1e${line} ${art.substring(7)}}}">`;
                    }
                    return `</${quickCommandTagName} ${quickCloseAttr}="<%}%>"><${quickCommandTagName}${sourceArt} ${quickAutoAttr} ${quickOpenAttr}="<%{%>" ${quickElseAttr}>`;
                } else if (art.startsWith('/each') ||
                    art.startsWith('/forin') ||
                    art.startsWith('/for') ||
                    art.startsWith('/if')) {
                    return `</${quickCommandTagName} ${quickCloseAttr}="<%}%>">`;
                }
            } else {
                return m;
            }
        }
        return m;
    });
    //console.log(src);

    src = tmplCmd.store(src, cmds, artCommandReg);
    //console.log(src);
    src = storeHTML(src, tags);
    //console.log(src);
    while (tagHReg.test(src)) {
        tagHReg.lastIndex = 0;
        src = src.replace(tagHReg, m => {
            m = tags[m];
            let src = m.src;
            //console.log('src',src,m.tag);
            if (m.tag) {
                src = src.replace(quickLoopReg, (_, k, $, c) => {
                    c = tmplCmd.recover(c, cmds);
                    let li = artExpr.extractArtInfo(c);
                    if (li) {
                        let expr = artExpr.extractAsExpr(li.art);
                        //console.log(expr,li.art);
                        if (!expr.value) {
                            expr.value = utils.uId('$q_v_', '', 1);
                        }
                        if (expr.bad || expr.splitter != 'as') {
                            console.log(chalk.red(`[MXC-Error(tmpl-quick)] unsupport or bad ${k} {{${li.art}}} at line:${li.line}`), 'file', chalk.gray(e.shortHTMLFile));
                            throw new Error(`[MXC-Error(tmpl-quick)] unsupport or bad ${k} {{${li.art}}} at ${e.shortHTMLFile}`);
                        }
                        if (!expr.index) {
                            expr.index = utils.uId('$q_key_', '', 1);
                        }
                        let firstAndLastVars = '';
                        let flv = '';
                        if (expr.first) {
                            firstAndLastVars += ',' + expr.first;
                            flv += ',' + expr.first;
                        } else {
                            firstAndLastVars += ',-1';
                        }
                        if (expr.last) {
                            firstAndLastVars += ',' + expr.last;
                            flv += ',' + expr.last;
                        } else {
                            firstAndLastVars += ',-1';
                        }
                        let prefix = '';
                        if (!m.special) {
                            count++;
                            prefix = quickOpenAttr + '="<%{%>" ';
                        }
                        //console.log(expr.value);
                        return `${prefix}${quickDeclareAttr}="<%let ${expr.index},${expr.value}=${expr.iterator}[${expr.index}]${flv}%>" ${k}="<%'${li.line}\x11${attrMap.escapeBreak(tmplCmd.escapeStringChars(li.art))}\x11'%><%(${expr.value},${expr.index}${firstAndLastVars},${expr.asc ? 1 : -1},${expr.step}) in ${expr.iterator}%>"`;
                    }
                    return _;
                }).replace(quickConditionReg, (_, k, $, c) => {
                    c = tmplCmd.recover(c, cmds);
                    //console.log('qod',c);
                    let li = artExpr.extractArtInfo(c);
                    if (li) {
                        let expr = artExpr.extractIfExpr(li.art);
                        let key = k == quickForAttr ? 'for' : 'if';
                        return `${k}="<%'${li.line}\x11${attrMap.escapeBreak(tmplCmd.escapeStringChars(li.art))}\x11'%><%${key}(${expr});%>"`;
                    }
                    return _;
                });
            }
            return src;
        });
    }
    if (count) {
        src = src.replace(lastCloseReg, (m, more) => {
            return ` ${quickCloseAttr}="<%${new Array(count + 1).join('}')}%>">${more}`;
        });
    }
    for (let c in cmds) {
        let v = cmds[c];
        if (typeof v == 'string') {
            v = artExpr.removeLine(v);
            cmds[c] = v;
        }
    }
    src = tmplCmd.recover(src, cmds);
    //console.log('here',JSON.stringify(src));
    src = artExpr.recoverEvent(src);
    return src;
};
let combineSamePush = (src, pushed) => {
    let start = -1,
        prev = '',
        ranges = [],
        lastChar = '';
    for (let p of pushed) {
        let i = src.indexOf(p.src, start);
        if (i >= 0) {
            if (i == start && prev == p.key) {
                if (!lastChar) {
                    lastChar = src.charAt(i - 2);
                }
                let len = p.src.indexOf(p.key);
                let rest = p.src.substring(len + prev.length);
                let trimmed = rest.startsWith('.push') ? 6 : rest.indexOf('[') + 1;
                ranges.push({
                    char: ',',
                    start: i - 2,//$vnode_.push($_create());  trim );
                    srcEnd: i + p.src.length,
                    end: i + p.key.length + len + trimmed //$vnode_.push($_create()); trim $vnode_.push(
                });
            } else {
                if (lastChar) {
                    let last = ranges[ranges.length - 1];
                    ranges.push({
                        char: lastChar,
                        start: last.srcEnd - 2,
                        end: last.srcEnd - 1
                    });
                    lastChar = '';
                }
            }
            start = i + p.src.length;
            prev = p.key;
        }
    }
    if (lastChar) {
        let last = ranges[ranges.length - 1];
        ranges.push({
            char: lastChar,
            start: last.srcEnd - 2,
            end: last.srcEnd - 1
        });
    }
    for (let i = ranges.length; i--;) {
        let r = ranges[i];
        src = src.substring(0, r.start) + r.char + src.substring(r.end);
    }
    return src;
};
let process = (src, e, prefix) => {
    //console.log(src);
    let { cmds, tokens, map, groupUsed, groupDeclared } = parser(`${src}`, e);
    let snippets = [],
        groupContextVars = e.groupContextVars,
        globalVars = e.globalVars,
        groupDeclaredMap = Object.create(null),
        groupIdsMap = Object.create(null);
    let allGroups = groupDeclared.concat(groupUsed);
    for (let gd of groupDeclared) {
        if (groupDeclaredMap[gd.groupKey]) {
            throw new Error(`[MXC Tip(tmpl-quick)] duplicate mx-slot name="${gd.groupKey}" at file:` + e.shortHTMLFile);
        }
        groupDeclaredMap[gd.groupKey] = gd;
        if (gd.groupId) {
            groupIdsMap[gd.groupId] = gd;
        }
    }
    let vnodeDeclares = Object.create(null),
        vnodeInited = Object.create(null),
        combinePushed = [],
        staticVars = [],
        specialStaticVars = {},
        specialFlags = {},
        specialFlagIndex = 0,
        staticProps = Object.create(null),
        staticNodes = Object.create(null),
        staticObjects = Object.create(null),
        staticCounter = 0,
        inlineStaticHTML = Object.create(null),
        transformGlobalGroupToLocal = Object.create(null),
        staticUniqueKey = e.shortHTMLUId,
        declaredRemoved = [],
        rebuildDeclared = [],
        rootCanHoisting = true;
    let getStaticProp = oldStr => {
        let i = staticProps[oldStr];
        if (i) {
            oldStr = i.key;
        } else {
            let key = `$quick_${staticUniqueKey}_${staticCounter++}_static_prop`;
            staticProps[oldStr] = {
                key,
            };
            oldStr = key;
        }
        return oldStr;
    };
    let genElement = (node, level, inStaticNode, inContextNode,
        usedParentVars = {}, vnodePrefix = '$vnode') => {
        if (inContextNode) {
            vnodePrefix = '$slot';
        }
        let levelPrefix = `${vnodePrefix}_${level}`;
        if (node.type == 3) {
            let content = node.content;
            let cnt = tmplCmd.recover(content, cmds);
            let text = serAttrs('$text', cnt, e);
            if (node.isXHTML ||
                text.hasCmdOut ||
                text.hasCharSnippet) {
                let outText = '',
                    safeguard = false;
                if (text.direct) {
                    outText = text.returned;
                    if (!text.hasCtrl &&
                        !text.hasCmdOut &&
                        !text.hasVarOut) {
                        outText = getStaticProp(outText);
                    }
                } else {
                    snippets.push(text.returned + ';');
                    vnodeDeclares.$text = 1;
                    outText = '$text';
                    safeguard = !text.hasSnippet;
                }
                if (node.isSafe) {
                    outText = `${configs.tmplSanitizeMethiod}(${outText})`;
                    if (!globalVars.includes(configs.tmplSanitizeMethiod)) {
                        globalVars.push(configs.tmplSanitizeMethiod);
                    }
                }
                //console.log(node);
                //let xHTML = node.isXHTML ? '1' : '0';
                outText += node.isXHTML ? ',1' : '';
                let staticPrefix = '';
                let staticPostfix = '';
                if (!inStaticNode &&
                    !text.hasCmdOut &&
                    !text.hasVarOut &&
                    text.direct &&
                    !text.hasCtrl) {
                    let key = `$quick_${md5(node.content, 'tmpl_static_texts')}_static_text`;
                    if (!staticNodes[key]) {
                        staticNodes[key] = key;
                        staticVars.push({
                            key
                        });
                    }
                    //console.log(key);
                    staticPrefix = `${key}||(${key}=`;
                    staticPostfix = ')';
                }
                if (vnodeInited[level]) {
                    if (!usedParentVars[`d${level}`]) {
                        usedParentVars[`n${level}`] = 1;
                    }
                    if (!safeguard) {
                        combinePushed.push({
                            key: levelPrefix,
                            src: `${levelPrefix}.push(${staticPrefix}$createVNode(0,${outText})${staticPostfix});`
                        });
                    }
                    snippets.push(`${levelPrefix}.push(${staticPrefix}$createVNode(0,${outText})${staticPostfix});`);
                } else {
                    usedParentVars[`d${level}`] = 1;
                    vnodeInited[level] = 1;
                    if (!safeguard) {
                        combinePushed.push({
                            key: levelPrefix,
                            src: `${levelPrefix}=[${staticPrefix}$createVNode(0,${outText})${staticPostfix}];`
                        });
                    }
                    snippets.push(`${levelPrefix}=[${staticPrefix}$createVNode(0,${outText})${staticPostfix}];`);
                    //console.log(snippets);
                }
                //console.log(snippets);
            } else {
                if (!text.trimmedPrefix) {
                    vnodeDeclares.$text = 1;
                }
                let str = text.returned.trimEnd();
                str = str.replace(attrEmptyText, '');
                if (!str.endsWith(';')) {
                    str += ';';
                }
                snippets.push(str);
            }
        } else {
            let attrs = {},
                attrsStr = '',
                ctrlAttrs = [],
                hasInlineCtrl = false,
                hasAttrs = false,
                hasCmdOut = node.attrHasDynamicViewId,
                dynamicAttrs = '',
                hasCtrl,
                hasRestElement = false,
                attrKeys = Object.create(null),
                specialKey = '',
                inGroup = false;
            if (configs.tmplSupportSlotFn) {
                inGroup = isInGroupNode(node, allGroups, false);
            }
            if (node.groupRootRefs) {
                let rRefs = node.groupRootRefs.split(',');
                for (let r of rRefs) {
                    delete groupContextVars[r];
                }
            }
            //console.log(node.tag, node.attrs);
            if (node.tag != tmplGroupTag &&
                node.attrs.length) {
                for (let a of node.attrs) {
                    if (a.name == 'mx-mbind' ||
                        a.name == mxPrefix + '-mbind') {
                        continue;
                    }
                    if (a.name == 'mx-encode' ||
                        a.name == mxPrefix + '-encode') {
                        continue;
                    }
                    if (a.name == 'mx-ctrl' &&
                        node.customBindExpr) {
                        continue;
                    }
                    if (a.name == 'mx-ref' &&
                        inGroup) {
                        continue;
                    }
                    if (a.name == 'mx-host' &&
                        node.customHost) {
                        continue;
                    }
                    if (a.name == 'mx-expr' &&
                        node.customBindForExpr) {
                        continue;
                    }
                    if (a.name == 'mx-lazyload' ||
                        a.name == mxPrefix + '-lazyload') {
                        continue;
                    }
                    if (a.name == 'mx-lazycreate' ||
                        a.name == mxPrefix + '-lazycreate') {
                        continue;
                    }
                    hasAttrs = true;
                    if (a.name == 'mx-bindexpr' ||
                        a.name == 'mx-syncexpr') {
                        a.name = 'mx-ctrl';
                    } else if (a.name == 'mx-forexpr' ||
                        a.name == 'mx-forbind') {
                        a.name = 'mx-expr';
                    } else if (a.name == 'mx-bindto' ||
                        a.name == 'mx-syncto' ||
                        a.name == 'mx-syncfrom' ||
                        a.name == 'mx-bindfrom') {
                        a.name = 'mx-host';
                    } else if (node.lazyCreate &&
                        (a.name == 'mx-view' ||
                            a.name == mxPrefix + '-view')) {
                        a.name = mxPrefix + '-lazy-view';
                    }
                    //console.log(groupKeyAsParams);
                    if (node.isMxView &&
                        a.name == tmplMxViewParamKey) {
                        let updateByKeys = node.updateByKeys;
                        let newKeys = [];
                        if (updateByKeys) {
                            let keys = updateByKeys.split(',');
                            for (let k of keys) {
                                k = k.trim();
                                if (k == 'this') {
                                    newKeys.length = 0;
                                    newKeys.push('#');
                                    break;
                                } else {
                                    newKeys.push(k);
                                }
                            }
                        } else {
                            let itKeys = a.value.split(',');
                            let slot = '$slots';
                            let findAllDataChanged = inGroup || itKeys.indexOf(slot) != -1;
                            if (findAllDataChanged) {
                                newKeys.push('#');
                            } else {
                                let recastKeys = [];
                                for (let k of itKeys) {
                                    if (k !== '$viewId') {
                                        if (k.startsWith(`${slot}.`)) {
                                            let cut = k.substring(slot.length + 1);
                                            let dest = groupDeclaredMap[cut];
                                            if (dest) {
                                                let ref = [];
                                                findAllInnerGroups(dest, groupUsed, groupDeclared, groupDeclaredMap, groupIdsMap, ref);
                                                for (let i of ref) {
                                                    if (i.groupRootRefs) {
                                                        recastKeys.push(...i.groupRootRefs.split(','));
                                                    }
                                                }
                                            }
                                        } else {
                                            recastKeys.push(k);
                                        }
                                    }
                                }

                                for (let k of recastKeys) {
                                    if (!newKeys.includes(k)) {
                                        newKeys.push(k);
                                    }
                                }
                            }
                        }
                        if (newKeys.length) {
                            if (newKeys.includes('#')) {
                                a.value = '#';
                            } else {
                                a.value = newKeys.join(',');
                            }
                        } else {
                            continue;
                        }
                    }
                    if (a.name.startsWith('mx-') &&
                        !a.name.startsWith(mxPrefix + '-')) {
                        a.name = mxPrefix + a.name.substring(2);
                    }
                    if (a.name.startsWith(mxPrefix) &&
                        !a.unary &&
                        a.value.startsWith('\x1f\x1e')) {
                        a.value = a.value.replace(spanceAndSemicolonReg, '');
                        //debugger;
                        if (inGroup) {
                            a.value = '\x1f\x1e\x1e' + a.value.substring(2);
                        } else {
                            let { has, offset } = findParentHasMagixEvent(node, a.name.substring(mxPrefix.length + 1), map);
                            if (has) {
                                a.value = `\x1f\x1e${offset || ''}\x1e` + a.value.substring(2);
                            }
                        }
                    }
                    if (a.name == tmplTagReusedKey) {
                        a.name = tmplShortMX.reused;
                        if (configs.tmplSupportSlot) {
                            a.value = `${staticUniqueKey} ${a.value}`;
                        }
                    }
                    if (configs.tmplShortMX) {
                        if (a.name == mxPrefix + '-view') {
                            a.name = tmplShortMX.view;
                        } else if (a.name == mxPrefix + '-owner') {
                            a.name = tmplShortMX.owner;
                        } else if (a.name == tmplMxViewParamKey) {
                            a.name = tmplShortMX.viewParamsUsed;
                        } else if (a.name == tmplStaticKey) {
                            a.name = tmplShortMX.static;
                        } else if (a.name.startsWith(mxPrefix + '-')) {
                            a.name = tmplShortMX.commonPrefix + a.name.substring(mxPrefix.length + 1);
                        }
                    }
                    if (configs.tmplRadioOrCheckboxRename &&
                        a.name == 'name' &&
                        a.value &&
                        (node.inputType == 'radio' ||
                            node.inputType == 'checkbox')) {
                        let newValue = (configs.hashedProjectName ? configs.hashedProjectName + '_' : '') + md5(e.from, tmplRadioOrCheckboxKey);
                        //console.log(e.from, a.value, newValue, JSON.stringify(a.value));
                        //tmplCommandAnchorReg.lastIndex = 0;
                        // if (tmplCommandAnchorReg.test(a.value)) {
                        //     tmplCommandAnchorReg.lastIndex = 0;
                        newValue += '_' + a.value;
                        //}
                        a.value = newValue;
                    }
                    if (a.unary) {
                        a.value = true;
                    } else {
                        a.value = tmplCmd.recover(a.value, cmds);
                    }
                    if (attrKeys[a.name] === 1 &&
                        e.checker.tmplDuplicateAttr) {
                        let v = a.unary ? '' : `="${a.cond ? a.cond.value : a.value}"`;
                        console.log(chalk.red('[MXC Tip(tmpl-quick)] duplicate attr:' + a.name), 'near:', chalk.magenta(node.tag + '->' + a.name + v), 'at file:', chalk.gray(e.shortHTMLFile));
                        continue;
                    }
                    attrKeys[a.name] = 1;
                    let bProps = attrMap.getBooleanProps(node.tag, node.inputType);
                    let bAttr = bProps[a.name];
                    if (bAttr) {
                        if (a.name == a.value ||
                            a.value == 'true') {
                            a.value = true;
                        } else if (a.value == 'false') {
                            a.value = false;
                        }
                    }

                    let oKey = encodeSlashRegExp(a.name);
                    let key = `$$_${utils.safeVar(a.name)}`;
                    let attr = serAttrs(key, a.value, e, inGroup);
                    attr.returned = toNumberString(attr.returned);
                    // if (attr.direct &&
                    //     attr.returned &&
                    //     utils.isString(attr.returned) &&
                    //     !attr.returned.includes('`')) {
                    //     attr.returned = toTemplateString(attr.returned);
                    // }
                    hasCtrl = attr.hasCtrl;
                    if (attr.hasCmdOut || attr.hasVarOut || a.cond) {
                        hasCmdOut = true;
                    }
                    if (a.name == quickSpreadAttr) {
                        attr.direct = false;
                    }
                    let cond = '';
                    let outputBoolean = false;
                    if (a.cond) {
                        let { line,
                            art,
                            hasExt,
                            condContent,
                            origin,
                            valuable,
                            isRef,
                            refVar } = a.cond;
                        outputBoolean = !valuable && !hasExt;
                        //<input disabled="{{=user.checked}}?"/>
                        if (a.value === true || outputBoolean) {
                            attr.returned = '';
                            cond += '(';
                        } else if (attr.direct) {
                            //<input value="{{=user}}?{{=user.value}}"/>
                            //<input value="{{=user.age}}?"/>
                            let v = hasExt ? '' : tmplVarTempKey + '=';
                            cond += `(${v}(`;
                            attr.returned = `(${attr.returned})`;
                        } else {
                            //console.log('xxxx');
                            cond += `((`;
                        }
                        //console.log(attr, cond, a);
                        if (configs.debug) {
                            cond += `$__line=${line},$__art='{{${art}}}',$__ctrl='<%${origin}%>',`;
                        }
                        cond += isRef ? refVar : condContent;
                        if (a.value === true || outputBoolean) {
                            cond += ')';
                        } else {
                            if (valuable) {
                                cond += '))!=null&&';
                            } else {
                                cond += '))&&';
                            }
                            if (!hasExt) {
                                attr.returned = tmplVarTempKey;
                                //值判断
                                // if (valuable) {
                                //     attr.returned = '';
                                //     cond = cond.slice(0, -2);
                                // }
                            }
                        }
                    }
                    if (configs.debug &&
                        attr.direct) {
                        if ((bAttr ||
                            (a.cond &&
                                !a.cond.hasExt &&
                                !a.cond.valuable)) &&
                            (a.value !== true ||
                                outputBoolean ||
                                a.cond)) {
                            if (a.value === true || outputBoolean) {
                                cond = `(${tmplVarTempKey}=${cond},${tmplVarTempKey}!=null&&${tmplVarTempKey}!==false&&${tmplVarTempKey}!==true&&console.error('make sure attr:"${a.name}" returned only true , false or null value\\r\\nat line:'+$__line+'\\r\\nat file:${encodeSlashRegExp(e.shortHTMLFile)}\\r\\ncurrent returned value is:',JSON.stringify(${tmplVarTempKey})),${tmplVarTempKey})`;
                            } else if (attr.direct) {
                                let assign = attr.returned == tmplVarTempKey ? '' : `${tmplVarTempKey}=${attr.returned},`;
                                attr.returned = `(${assign}${tmplVarTempKey}!=null&&${tmplVarTempKey}!==false&&${tmplVarTempKey}!==true&&console.error('make sure attr:"${a.name}" returned only true , false or null value\\r\\nat line:'+$__line+'\\r\\nat file:${encodeSlashRegExp(e.shortHTMLFile)}\\r\\ncurrent returned value is:',JSON.stringify(${tmplVarTempKey})),${tmplVarTempKey})`;
                            }
                        } else if (a.name.startsWith(mxPrefix) &&
                            a.cond &&
                            a.cond.hasExt &&
                            !a.cond.valuable &&
                            cond.endsWith(')&&')) {
                            cond = cond.slice(1, -3);
                            cond = `((${tmplVarTempKey}=${cond},(${tmplVarTempKey}||${tmplVarTempKey}!=null&&${tmplVarTempKey}!==false&&${tmplVarTempKey}!==true&&console.error('make sure attr:"${a.name}" returned only true , false or null value\\r\\nat line:'+$__line+'\\r\\nat file:${encodeSlashRegExp(e.shortHTMLFile)}\\r\\ncurrent returned value is:',JSON.stringify(${tmplVarTempKey})),${tmplVarTempKey})))&&`;
                        }
                    }
                    if (attr.direct) {
                        if (hasRestElement) {
                            ctrlAttrs.push({
                                ctrl: cond + attr.returned,
                                type: 'direct',
                                oKey
                            });
                        } else {
                            let dv = cond + attr.returned;
                            if (!cond &&
                                attr.returned &&
                                !attr.hasCtrl &&
                                !attr.hasCmdOut &&
                                !attr.hasVarOut) {
                                dv = getStaticProp(dv);
                            }
                            attrs[oKey] = dv == '' ? '``' : dv;
                        }
                    } else {
                        hasInlineCtrl = true;
                        if (a.name == quickSpreadAttr) {
                            hasRestElement = true;
                            ctrlAttrs.push({
                                type: 'mixed',
                                ctrl: attr.returned
                            });
                        } else {
                            vnodeDeclares[key] = 1;
                            ctrlAttrs.push({
                                ctrl: attr.returned,
                                oKey,
                                key: cond + key
                            });
                        }
                    }
                    //console.log(ctrlAttrs);
                    if (configs.debug && bAttr && !attr.direct) {
                        ctrlAttrs.push({
                            ctrl: `(${key}!=null&&${key}!==false&&${key}!==true&&console.error('make sure attr:"${a.name}" returned only true , false or null value\\r\\nat line: '+$__line+'\\r\\nat file:${encodeSlashRegExp(e.shortHTMLFile)}\\r\\ncurrent returned value is:',JSON.stringify(${key})));`
                        });
                    }
                }
                let allProps = attrMap.getProps(node.tag, node.inputType);
                let mustUseProps = [];
                if (node.tag == 'textarea') {
                    mustUseProps.push(`_:1`);
                }
                if (hasInlineCtrl) {
                    if (hasRestElement) {
                        //console.log(ctrlAttrs);
                        for (let c of ctrlAttrs) {
                            if (c.type != 'mixed' && c.type != 'direct') {
                                dynamicAttrs += c.ctrl + ';';
                            }
                        }
                        attrsStr = '{';
                        for (let p in attrs) {
                            attrsStr += `'${p}': ${attrs[p]},`;
                            if (allProps[p]) {
                                let dv = getStaticProp(`\`${allProps[p]}\``);
                                mustUseProps.push(`'${p}':${dv}`);
                            }
                        }
                        for (let c of ctrlAttrs) {
                            if (c.type == 'direct') {
                                attrsStr += `'${c.oKey}': ${c.ctrl},`;
                                if (allProps[c.oKey]) {
                                    let dv = getStaticProp(`\`${allProps[c.oKey]}\``);
                                    mustUseProps.push(`'${c.oKey}':${dv}`);
                                }
                            } else if (c.type == 'mixed') {
                                attrsStr += `...${c.ctrl}, `;
                            } else if (c.oKey) {
                                attrsStr += `'${c.oKey}': ${c.key},`;
                                if (allProps[c.oKey]) {
                                    let dv = getStaticProp(`\`${allProps[c.oKey]}\``);
                                    mustUseProps.push(`'${c.oKey}':${dv}`);
                                }
                            }
                        }
                        attrsStr += '}';
                    } else {
                        dynamicAttrs += ';';
                        for (let c of ctrlAttrs) {
                            dynamicAttrs += c.ctrl + ';';
                        }
                        attrsStr = '{';
                        for (let p in attrs) {
                            attrsStr += `'${p}': ${attrs[p]},`;
                            if (allProps[p]) {
                                let dv = getStaticProp(`\`${allProps[p]}\``);
                                mustUseProps.push(`'${p}':${dv}`);
                            }
                        }
                        for (let c of ctrlAttrs) {
                            if (c.oKey) {
                                attrsStr += `'${c.oKey}': ${c.key},`;
                                if (allProps[c.oKey]) {
                                    let dv = getStaticProp(`\`${allProps[c.oKey]}\``);
                                    mustUseProps.push(`'${c.oKey}':${dv}`);
                                }
                            }
                        }
                        attrsStr += '}';
                    }
                } else {
                    attrsStr = '{';
                    for (let p in attrs) {
                        attrsStr += `'${p}': ${attrs[p]},`;
                        if (allProps[p]) {
                            let dv = getStaticProp(`\`${allProps[p]}\``);
                            mustUseProps.push(`'${p}':${dv}`);
                        }
                    }
                    attrsStr += '}';
                    if (!hasCmdOut &&
                        !hasCtrl &&
                        !node.canHoisting &&
                        node.tag != quickCommandTagName &&
                        node.tag != quickDirectTagName &&
                        !node.groupKeyNode &&
                        !node.groupUseNode &&
                        !node.hasMxOwner &&
                        !node.hasFromOrTo) {
                        let i = staticObjects[attrsStr];
                        if (i) {
                            attrsStr = i.key;
                            i.used++;
                            if (!inStaticNode) {
                                i.inStatic = false;
                            }
                        } else {
                            let key = `$quick_${staticUniqueKey}_${staticCounter++}_static_attr`;
                            staticObjects[attrsStr] = {
                                key,
                                used: 1,
                                inStatic: inStaticNode
                            };
                            attrsStr = key;
                        }
                    }
                }
                if (mustUseProps.length) {
                    let specials = '{',
                        flag = 0;
                    for (let p of mustUseProps) {
                        specials += `${p},`;
                        if (!specialFlags[p]) {
                            specialFlags[p] = 2 << specialFlagIndex;
                            specialFlagIndex++;
                        }
                        flag |= specialFlags[p];
                    }
                    specials += '}';
                    specialKey = `$special_${flag}`;
                    if (!specialStaticVars[specialKey]) {
                        specialStaticVars[specialKey] = specials;
                    }
                }
            }
            let ctrls = node.ctrls;
            let start = [], end = [];

            if (ctrls.length) {
                for (let ctrl of ctrls) {
                    let fn = Directives[ctrl.type];
                    if (fn) {
                        fn(ctrl, start, end, node.auto);
                    }
                }
            }
            snippets.push(`${start.join('')}`);
            if (node.groupKeyNode) {
                if (node.groupContextNode) {
                    if (!configs.tmplSupportSlotFn) {
                        console.log(chalk.red('[MXC Tip(tmpl-quick)] tmplSupportSlotFn is false,can not use mx-slot fn attribute'), 'at file:', chalk.gray(e.shortHTMLFile));
                        throw new Error('[MXC Tip(tmpl-quick)] tmplSupportSlotFn is false,can not use mx-slot fn attribute at file:' + e.shortHTMLFile);
                    }
                    let newKey = quickGroupObjectPrefix + node.groupKey;// //`${quickGroupObjectPrefix}${staticUniqueKey}_${safeVar(node.groupKey)}`;
                    if (!node.groupContextHasOuterVar) {
                        snippets.push(`\nif(!${newKey}){`);
                    }

                    let params = '';// = `$id = $viewId`;
                    if (node.groupContext) {
                        // params += ',' + node.groupContext;
                        params = node.groupContext;
                    }
                    snippets.push(`${newKey}=(${params})=>{\n`);
                    if (node.children.length) {
                        if (configs.debug) {
                            snippets.push(`\ntry{\r\n`);
                        } else if (!node.canHoisting &&
                            configs.tmplQuickWithTryCatch) {
                            snippets.push(`\ntry{\r\n`);
                        }
                    }
                }
            }
            let key = '';
            if (node.canHoisting &&
                !node.groupUseNode) {
                //console.log(node);
                if (node.groupKeyNode) {
                    if (node.groupContextNode) {
                        key = `$quick_slot_${staticUniqueKey}_${node.groupKey}_static_node`;
                        if (!staticNodes[key] &&
                            node.children.length) {
                            staticNodes[key] = key;
                            staticVars.push({
                                key
                            });
                        }
                    } else {
                        key = quickGroupObjectPrefix + node.groupKey;
                    }
                    if (node.children.length) {
                        snippets.push(`\r\nif(!${key}){\r\n`);
                    }
                } else {
                    key = staticNodes[node.staticValue];
                    if (!key) {
                        key = `$quick_${staticUniqueKey}_${staticCounter++}_static_node`;
                        staticNodes[node.staticValue] = key;
                        staticVars.push({
                            key
                        });
                    }
                    snippets.push(`\r\nif(${key}){\r\n`);
                    if (vnodeInited[level]) {
                        if (!usedParentVars[`d${level}`]) {
                            usedParentVars[`n${level}`] = 1;
                        }
                        snippets.push(`${levelPrefix}.push(${key});`);
                    } else {
                        usedParentVars[`d${level}`] = 1;
                        snippets.push(`${levelPrefix}=[${key}];`);
                    }
                    snippets.push(`\r\n}else{\r\n`);
                }
            } else if (node.groupUseNode) {
                if (groupDeclaredMap[node.groupUse]) {
                    key = quickGroupObjectPrefix;
                } else if (!globalVars.includes(node.groupUse)) {
                    globalVars.push(node.groupUse);
                }
                key += node.groupUse;//`$quick_slot_${staticUniqueKey}_${safeVar(node.groupUse)}_static_node`;
                let refVar = key;
                //if (node.canHoisting) {
                // let skey = `$quick_slot_${staticUniqueKey}_${safeVar(node.groupUse)}_static_node`;
                // if (!staticNodes[skey]) {
                //     staticNodes[skey] = skey;
                //     staticVars.push({
                //         key: skey
                //     });
                // }
                //console.log('enter', levelPrefix, skey);
                //snippets.push(`if(${skey}){\n${levelPrefix}.push(...${skey});\n}else{\n`);
                //}
                if (node.groupContextNode) {
                    //key += '($id';
                    key += '?.(';
                    // if (node.groupUniqueContent) {
                    //     let splitContents = jsGeneric.splitParams(node.groupUniqueContent);
                    //     let extendKeys = [];
                    //     for (let cmd of splitContents) {
                    //         let i = tmplCmd.extractCmdContent(cmd, cmds);
                    //         if (i.succeed) {
                    //             if (configs.debug) {
                    //                 snippets.push(`$__line=${i.line};$__art='${encodeSlashRegExp(i.art.substring(1))}';$__ctrl='${encodeSlashRegExp(i.content)}';`);
                    //             }
                    //             extendKeys.push(i.content);
                    //         }
                    //     }
                    //     if (extendKeys.length) {
                    //         key += `+'.'+${extendKeys.join(`+'.'+`)}`;
                    //     }
                    // }
                    if (node.groupContext) {
                        let info = tmplCmd.extractCmdContent(node.groupContext, cmds);
                        let content;
                        if (info.succeed) {
                            content = info.content.trim();
                            // if (content.startsWith('(') &&
                            //     content.endsWith(')')) {
                            //     content = content.slice(1, -1);
                            // }
                        } else {
                            content = '';
                            console.log(chalk.red('[MXC-Error(tmpl-quick)] process mx-slot use: ' + node.groupContext + ' failed'));
                        }
                        // let splitContents = jsGeneric.splitParams(node.groupContext);
                        // for (let sc of splitContents) {
                        //     if (isVarName(sc) &&
                        //         !e.globalVars.includes(sc)) {
                        //         e.globalVars.push(sc);
                        //     }
                        // }
                        //key += ',' + node.groupContext;
                        key += content;
                    }
                    key += ')'
                    if (node.canHoisting) {
                        refVar = `$quick_slot_${staticUniqueKey}_${utils.safeVar(node.groupUse)}_static_node`;
                    } else {
                        refVar = `$ref_${staticCounter++}_node`;
                    }
                    snippets.push(`\nlet ${refVar}=${key};\n`);
                }
                snippets.push(`if(${refVar}){\n${levelPrefix}.push(...${refVar});\n`);
                if (node.children.length) {
                    snippets.push(`}else{\n`);
                }
            } else if (node.inlineStaticValue) {
                key = `$inline$${staticUniqueKey}_${node.inlineStaticValue}`;
                if (!vnodeDeclares[key]) {
                    vnodeDeclares[key] = 1;
                }
                snippets.push(`\r\nif(${key}){\r\n`);
                if (vnodeInited[level]) {
                    if (!usedParentVars[`d${level}`]) {
                        usedParentVars[`n${level}`] = 1;
                    }
                    snippets.push(`${levelPrefix}.push(${key});`);
                } else {
                    usedParentVars[`d${level}`] = 1;
                    snippets.push(`${levelPrefix}=[${key}];`);
                }
                snippets.push(`\r\n}else{\r\n`);
            }
            // let isDynamicGroupSnippet = !node.canHoisting && node.groupKeyNode && !node.groupContextNode;
            // let nextLevelPrefix = isDynamicGroupSnippet ? `$vnode` : vnodePrefix;
            if (node.children.length) {
                if (node.staticValue &&
                    canGenerateHTML(node)) {
                    vnodeInited[level + 1] = 1;
                    vnodeDeclares[`${vnodePrefix}_${level + 1}`] = 1;
                    let exist = inlineStaticHTML[node.innerHTML];
                    let html = tmplCmd.getInnerHTML(node);
                    //html = tmplCmd.recover(html, cmds);
                    html = attrMap.escapeBreak(tmplCmd.escapeStringChars(html));
                    if (!exist) {
                        exist = {
                            count: 0,
                            level: [],
                            html,
                            key: staticCounter++
                        };
                        inlineStaticHTML[node.innerHTML] = exist;
                        inlineStaticHTML['\x00' + exist.key] = exist;
                    }
                    exist.count++;
                    exist.level.push(level + 1);
                    snippets.push(`//#inline_static_html_node_ph_${exist.key};\r\n`);

                } else {
                    //let pfx = isDynamicGroupSnippet ? '$slot_vn' : '$vnode';
                    delete vnodeInited[level + 1];
                    let declared = `${vnodePrefix}_${level + 1}=[${utils.uId('\x00', src)}];`;
                    for (let e of node.children) {
                        if (e.hasCtrls ||
                            e.tag == tmplGroupTag) {
                            snippets.push(declared);
                            vnodeInited[level + 1] = 1;
                            break;
                        }
                    }
                    let isGroupTag = node.tag == quickCommandTagName;
                    let nextLevel = isGroupTag ? level : level + 1;
                    let usedParent = {};
                    for (let e of node.children) {
                        genElement(e, nextLevel, inStaticNode || node.canHoisting, inContextNode || node.groupContextNode, usedParent, vnodePrefix);
                    }

                    if (usedParent[`n${level + 1}`] ||
                        usedParent[`d${level + 1}`]) {
                        vnodeDeclares[vnodePrefix + '_' + (level + 1)] = 1;
                    }
                    if (usedParent[`n${level + 1}`]) {
                        rebuildDeclared.push(declared);
                        delete usedParent[`n${level + 1}`];
                    } else {
                        declaredRemoved.push(declared);
                    }
                    Object.assign(usedParentVars, usedParent);
                }
            }
            if (node.isCtrlNode) {
                snippets.push(`${node.ctrl};`);
            } else if (node.tag == quickCommandTagName) {
                // if (node.children.length) {
                //     if (vnodeInited[level]) {
                //         combinePushed.push({
                //             key: `$vnode_${level}`,
                //             src: `$vnode_${level}.push(...$vnode_${level + 1});`
                //         });
                //         if (vnodeInited[level + 1]) {
                //             let v = vnodeInited[level + 1];
                //             v = v === 1 ? `$vnode_${level + 1}` : v;
                //             snippets.push(`$vnode_${level}.push(...${v});`);
                //         }
                //     } else if (vnodeInited[level + 1]) {
                //         vnodeInited[level] = 1;
                //         snippets.push(`$vnode_${level}=$vnode_${level + 1};`);
                //     }
                // }
            } else if (node.tag == quickDirectTagName) {
                if (configs.debug) {
                    snippets.push(`$__line=${node.directLine};$__art='{{${node.directArt}}}';$__ctrl='${encodeSlashRegExp(node.directCtrl)}';`);
                }
                let refVar = `$ref_${staticCounter++}_node`;
                snippets.push(`\nlet ${refVar}=${node.directCtrl};\n`);
                if (vnodeInited[level]) {
                    if (!usedParentVars[`d${level}`]) {
                        usedParentVars[`n${level}`] = 1;
                    }
                    snippets.push(`\r\nif(${refVar}){\r\n$isArray(${refVar})?${levelPrefix}.push(...${refVar}):${levelPrefix}.push(${refVar});}`);
                } else {
                    usedParentVars[`d${level}`] = 1;
                    vnodeInited[level] = 1;
                    snippets.push(`${levelPrefix}=${refVar} && $isArray(${refVar})?${refVar}:[${refVar}];`);
                }
            } else {
                let specialProps = specialKey;
                let children = '';
                if (node.children.length &&
                    vnodeInited[level + 1]) {
                    let t = vnodeInited[level + 1];
                    children = t === 1 ? `${vnodePrefix}_${level + 1}` : t;
                } else {
                    if (specialProps) {
                        if (node.unary) {
                            children = '1';
                        } else {
                            children = '0';
                        }
                    } else {
                        if (node.unary) {
                            children = '1';
                        } else {
                            children = '';
                        }
                    }
                }
                let props = hasAttrs ? attrsStr : children ? '0' : '';
                if (dynamicAttrs && !dynamicAttrs.endsWith(';')) {
                    dynamicAttrs += ';';
                }
                snippets.push(dynamicAttrs);
                let content = '';
                if (specialProps) {
                    content += `,${props},${children},${specialProps}`;
                } else if (children) {
                    content += `,${props},${children}`;
                } else if (props) {
                    content += `,${props}`;
                }
                if (node.groupKeyNode) {
                    // if (!node.children || !node.children.length) {
                    //     throw new Error(`[MXC-Error(tmpl-quick)] mx-slot name="${node.groupKey}" must have children elements at ${e.shortHTMLFile}`);
                    // }
                    if (node.groupContextNode) {
                        //console.log(node);
                        let exTmpl = `}catch(ex){let msg = 'render view error:' + (ex.message || ex); msg += '\\r\\n\\tsrc art: ' + $__art + '\\r\\n\\tat line: ' + $__line; msg += '\\r\\n\\ttranslate to: ' + $__ctrl + '\\r\\n\\tat file:${encodeSlashRegExp(e.shortHTMLFile)}'; throw msg;} `;
                        let catchTmpl = `}catch(ex){$logError(ex);return [$createVNode(0,'${encodeSlashRegExp(e.shortHTMLFile)} error:'+ex.message;}`;
                        if (node.canHoisting) {
                            //let src = `\r\n${prefix}=$vnode_${level + 1};`;
                            //snippets.push(src);
                            if (node.children.length) {
                                snippets.push(`$quick_slot_${staticUniqueKey}_${node.groupKey}_static_node = ${vnodePrefix}_${level + 1};\n`);
                                snippets.push(`\n}\nreturn $quick_slot_${staticUniqueKey}_${node.groupKey}_static_node;\n`);
                                if (configs.debug) {
                                    snippets.push(exTmpl);
                                }
                            }
                        } else {
                            snippets.push(`\nreturn ${vnodePrefix}_${level + 1};`);
                            if (configs.debug) {
                                snippets.push(exTmpl);
                            } else if (configs.tmplQuickWithTryCatch) {
                                snippets.push(catchTmpl);
                            }
                        }
                        snippets.push(`};\n`);
                        if (!node.groupContextHasOuterVar) {
                            snippets.push(`}\n`);
                        }
                    } else if (node.canHoisting) {
                        if (node.children.length) {
                            snippets.push(`$slots.${node.groupKey}=${vnodePrefix}_${level + 1};\n`);
                            snippets.push('}\n');
                        }
                    } else {
                        let locale = '$slot_local_' + staticCounter++;
                        transformGlobalGroupToLocal[`$slots.${node.groupKey}`] = locale;
                        vnodeDeclares[locale] = 1;
                        snippets.push(`$slots.${node.groupKey}=${vnodePrefix}_${level + 1};\n`);
                    }
                } else {
                    let prefix = (node.canHoisting || node.inlineStaticValue) ? `${key}=` : '', src = '';
                    if (node.groupUseNode) {
                        if (vnodeInited[level + 1] &&
                            node.children.length) {
                            let pfx = '';
                            if (node.canHoisting) {
                                pfx = `$quick_slot_${staticUniqueKey}_${utils.safeVar(node.groupUse)}_static_node=`;
                            }
                            src = `${levelPrefix}.push(...${pfx}${vnodePrefix}_${level + 1});\n`;
                            snippets.push(src);
                        }
                        snippets.push(`}\n`);
                        if (node.canHoisting) {
                            // snippets.push('}\n');
                        }
                        if (vnodeInited[level]) {
                            if (!usedParentVars[`d${level}`]) {
                                usedParentVars[`n${level}`] = 1;
                            }
                        } else {
                            usedParentVars[`d${level}`] = 1;
                        }
                    } else if (vnodeInited[level]) {
                        if (!usedParentVars[`d${level}`]) {
                            usedParentVars[`n${level}`] = 1;
                        }
                        let tag = getStaticProp(`\`${node.tag}\``);
                        src = `${levelPrefix}.push(${prefix}$createVNode(${tag}${content}));`;
                        combinePushed.push({
                            key: levelPrefix,
                            src
                        });
                        snippets.push(src);
                    } else {
                        let tag = getStaticProp(`\`${node.tag}\``);
                        src = `${levelPrefix}=[${prefix}$createVNode(${tag}${content})];`;
                        usedParentVars[`d${level}`] = 1;
                        vnodeInited[level] = 1;
                        combinePushed.push({
                            key: levelPrefix,
                            src
                        });
                        snippets.push(src);
                    }
                }
                if ((node.canHoisting &&
                    !node.groupUseNode &&
                    !node.groupKeyNode) ||
                    node.inlineStaticValue) {
                    snippets.push('\r\n}\n');
                }
            }
            snippets.push(end.join(''));
        }
    };
    //vnodeInited[0] = 1;
    for (let t of tokens) {
        if (!t.canHoisting) {
            rootCanHoisting = false;
        }
    }
    if (rootCanHoisting) {
        for (let t of tokens) {
            delete t.canHoisting;
            for (let i = t.attrs.length; i--;) {
                let v = t.attrs[i];
                if (v.name == tmplStaticKey) {
                    t.attrs.splice(i, 1);
                    break;
                }
            }
        }
    }
    let zeroIsEmptyArray = false;
    for (let e of tokens) {
        if (e.hasCtrls ||
            e.tag == tmplGroupTag) {
            zeroIsEmptyArray = true;
            vnodeInited[0] = 1;
            break;
        }
    }
    for (let t of tokens) {
        genElement(t, 0, rootCanHoisting, t.groupContextNode);
    }
    let source = `$vnode_0${zeroIsEmptyArray ? '=[]' : ''}`;
    // if (configs.tmplSupportSlotFn) {
    //     source += ',$id=$viewId';
    // }
    let innerCode = snippets.join('');
    innerCode = combineSamePush(innerCode, combinePushed);
    innerCode = innerCode.replace(inlineStaticHTMLReg, (_, c) => {
        let exist = inlineStaticHTML['\x00' + c];
        if (exist) {
            let l = exist.level.shift();
            if (!vnodeDeclares[`$vnode_${l}`]) {
                vnodeDeclares[`$vnode_${l}`] = 1;
            }
            if (exist.count == 1) {
                return `$vnode_${l}=[$createVNode(0,'${exist.html}',1)];`;
            } else {
                let key = `$inline$${staticUniqueKey}_${c}`;
                if (!vnodeDeclares[key]) {
                    vnodeDeclares[key] = 1;
                }
                return `if(${key}){\r\n$vnode_${l}=[${key}]\r\n}else{\r\n$vnode_${l}=[${key}=$createVNode(0,'${exist.html}',1)]\r\n}\r\n`;
            }
        }
        return _;
    }).replace(trimExtraElseReg, '');
    for (let dr of declaredRemoved) {
        innerCode = innerCode.replace(dr, '');
    }
    for (let rd of rebuildDeclared) {
        let ei = rd.indexOf('=');
        let prefix = rd.substring(0, ei);
        innerCode = innerCode.replace(rd, prefix + '=[];');
    }

    if (configs.tmplSupportSlot) {
        let recastLocale = [];
        innerCode = innerCode.replace(slotReg, (_, v) => {
            if (!groupDeclaredMap[v]) {
                if (!globalVars.includes(v)) {
                    globalVars.push(v);
                }
                return v;
            }
            let locale = transformGlobalGroupToLocal[_];
            if (locale) {
                if (!recastLocale.includes(locale)) {
                    recastLocale.push(locale);
                }
                return locale;
            }
            specialStaticVars[`$host_slots_${v}`] = '';
            return `$host_slots_${v}`;
        });
        for (let i = recastLocale.length; i--;) {
            let rl = recastLocale[i];
            let ri = innerCode.lastIndexOf(rl + '=$vnode_');
            let nextSem = innerCode.indexOf(';', ri) + 1;
            let assignment = innerCode.slice(ri, nextSem);
            let vn = assignment.match(vnodeMathcer)[1];
            let ai = innerCode.lastIndexOf(vn + '=', ri);
            let before = innerCode.substring(0, ai);
            let after = innerCode.substring(nextSem);
            let part = innerCode.slice(ai, ri);
            let reg = regexp.get(`${regexp.escape(vn)}([=\\.])`, 'g');
            part = part.replace(reg, rl + '$1');
            innerCode = before + part + after;
        }
    }
    let dataFromView = tmplGlobalDataRoot;
    if (globalVars?.length) {
        let vars = '{',
            out;
        for (let key of globalVars) {
            if (key != '$viewId' &&
                key != '$slots' &&
                !groupContextVars[key]) {
                vars += `\r\n\t${key},`;
                out = 1;
            }
        }
        vars += '}';
        if (innerCode.includes(tmplGlobalDataRoot)) {
            vars = `,${vars}=${tmplGlobalDataRoot}`;
            if (out) {
                source += vars;
            }
        } else if (out) {
            dataFromView = vars;
        }
    }
    //console.log(vnodeDeclares);
    for (let vd in vnodeDeclares) {
        source += ',\r\n' + vd;
        let v = vnodeDeclares[vd];
        if (v !== 1) {
            source += `=${v}`;
        }
    }
    source += ';';
    let key = `$quick_root_${staticUniqueKey}_${staticCounter++}_static_node`;
    if (innerCode.includes(tmplVarTempKey)) {
        source = `let ${tmplVarTempKey},${source}`;
    } else {
        source = 'let ' + source;
    }
    if (rootCanHoisting) {
        staticVars.push({
            key
        });
        source = `if(!${key}){\r\n${source}`;
    }
    let rootNode = `${rootCanHoisting ? `${key}=` : ''}$createVNode($viewId,0,$vnode_0);`;

    source += `\r\n${innerCode} \r\n`;
    if (rootCanHoisting) {
        source += rootNode + '\r\n}';
    }
    source += `\r\nreturn ${rootCanHoisting ? key : rootNode}`;

    if (configs.debug) {
        source = `let $__art, $__line, $__ctrl; try { ${source} \r\n} catch (ex) { let msg = 'render view error:' + (ex.message || ex); msg += '\\r\\n\\tsrc art: ' + $__art + '\\r\\n\\tat line: ' + $__line; msg += '\\r\\n\\ttranslate to: ' + $__ctrl + '\\r\\n\\tat file:${encodeSlashRegExp(e.shortHTMLFile)}'; throw new Error(msg); } `;
    } else if (configs.tmplQuickWithTryCatch) {
        source = ` try { ${source} \r\n} catch (ex) {$logError(ex); return $createVNode($viewId, 0,[$createVNode(0,'${encodeSlashRegExp(e.shortHTMLFile)} error:'+ex.message)]) } `;
    }
    let params = '', idx = tmplFnParams.length - 1;
    for (idx; idx >= 0; idx--) {
        let test = '(';
        if (tmplFnParams[idx] == '$refData') {
            test = ',';
        }
        if (source.indexOf(tmplFnParams[idx] + test) > -1) {
            break;
        }
    }
    for (let i = 0; i <= idx; i++) {
        params += ',' + tmplFnParams[i];
    }
    let arrow = prefix ? '' : '=>';
    if (!configs.debug &&
        configs.tmplQuickWithTryCatch) {
        source = `($logError,${dataFromView}, $createVNode,$viewId${params})${arrow} { \r\n${source} } `;
    } else {
        source = `(${dataFromView}, $createVNode,$viewId${params})${arrow} { \r\n${source} } `;
    }
    let _staticPropsArr = [];
    for (let i in staticProps) {
        let v = staticProps[i];
        _staticPropsArr.push({
            key: v.key,
            value: i
        });
    }
    e._staticProps = _staticPropsArr;
    for (let i in staticObjects) {
        let v = staticObjects[i];
        if (!v.inStatic || v.used > 1) {
            staticVars.push({
                key: v.key,
                value: i
            });
        } else {
            source = source.replace(v.key, regexp.encode(i));
        }
    }
    for (let s in specialStaticVars) {
        staticVars.push({
            key: s,
            value: specialStaticVars[s]
        });
    }
    return {
        source,
        statics: staticVars
    };
};
module.exports = {
    preProcess,
    process
};