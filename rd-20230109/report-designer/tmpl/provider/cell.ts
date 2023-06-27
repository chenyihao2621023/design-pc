/**
 * 提供格子所需要的默认属性
 */
import Magix from 'magix5';
import Const from '../designer/const';
import Transform from '../designer/transform';
let { guid } = Magix;
//圆角正则
let radiusReg = /\s*([\d.]+)([a-z%]+)\s+([\d.]+)([a-z%]+)\s+([\d.]+)([a-z%]+)\s+([\d.]+)([a-z%]+)\s*\/\s*([\d.]+)([a-z%]+)\s+([\d.]+)([a-z%]+)\s+([\d.]+)([a-z%]+)\s+([\d.]+)([a-z%]+)/;
/**
 * 获取圆角
 * @param radius 圆角
 */
let extractRadius = (radius: string) => {
    let left: string[] = [],
        right: string[] = [];
    let m = radius.match(radiusReg);
    if (m) {
        for (let i = 1; i < 9; i++) {
            left.push(m[i]);
        }
        for (let i = 9; i < 17; i++) {
            right.push(m[i]);
        }
    }
    return {
        '@:{r#left}': left,
        '@:{r#right}': right
    };
};
/**
 * 缩放圆角的一部分
 * @param part 圆角的一部分
 * @param factor 缩放比例
 */
let scaleRadiusPart = (part, factor: number) => {
    if (factor != 1) {
        for (let i = part.length; i--;) {
            let u = part[i--];
            if (u != '%') {
                part[i] *= factor;
            }
        }
    }
};
/**
 * 缩放圆角字符串
 * @param radius 圆角字符串
 * @param factor 缩放比例
 * @returns 缩放后的圆角
 */
let scaleRadius = (radius: string, factor: number) => {
    if (factor != 1) {
        let {
            '@:{r#left}': left,
            '@:{r#right}': right
        } = extractRadius(radius);
        scaleRadiusPart(left, factor);
        scaleRadiusPart(right, factor);
        return buildRadius(left, right);
    }
    return radius;
};
/**
 * 拼接圆角字符串
 * @param part 圆角部分
 */
let joinRadiusPart = part => {
    let r: string[] = [];
    for (let i = 0; i < part.length; i += 2) {
        r.push(part[i] + part[i + 1]);
    }
    return r.join(' ');
};
/**
 * 转换单位
 * @param part 圆角部分
 * @param toUnit 目标单位
 */
let convertRadiusPart = (part, toUnit) => {
    for (let i = part.length; i--;) {
        let u = part[i--];
        if (u != '%') {
            part[i + 1] = toUnit;
            part[i] = Const['@:{const#unit.to.unit}'](part[i], toUnit, u);
            part[i] = Const['@:{const#scale.to.unit}'](part[i], null, toUnit);
        }
    }
};
/**
 * 转换圆角单位
 * @param radius 圆角
 * @param toUnit 目标单位
 * @returns 
 */
let convertRadius = (radius: string, toUnit: string) => {
    let {
        '@:{r#left}': left,
        '@:{r#right}': right
    } = extractRadius(radius);
    convertRadiusPart(left, toUnit);
    convertRadiusPart(right, toUnit);
    return buildRadius(left, right);
};
/**
 * 构建圆角字符串
 * @param left 圆角左半部分
 * @param right 圆角右半部分
 * @returns 圆角字符串
 */
let buildRadius = (left, right) => `${joinRadiusPart(left)}/${joinRadiusPart(right)}`;
export default {
    '@:{cell#default.width}': 300,
    '@:{cell#default.height}': 100,
    '@:{cell#min.width}': 20,
    '@:{cell#min.height}': 20,
    '@:{cell#max.width}': 2000,
    '@:{cell#max.height}': 2000,
    '@:{cell#is.cell.focused}'({ focusRow, focusCol }) {
        return focusRow > -1 && focusCol > -1
    },
    '@:{cell#map}': {
        text: '@:{cell#text}',
        image: '@:{cell#image}',
        barcode: '@:{cell#barcode}',
        qrcode: '@:{cell#qrcode}',
        input: '@:{cell#input}',
        dropdown: '@:{cell#dropdown}'
    },
    '@:{cell#text}': {
        textLetterspacing: 0,
        textForecolor: '#000000',
        textFontsize: 14,
        textFontfamily: 'tahoma',
        textStyleBold: false,
        textStyleUnderline: false,
        textStyleItalic: false,
        textStyleStrike: false,
        textAutoHeight: true,
        textRichText: false,
        textContent: '',
        textFormat: ''
    },
    '@:{cell#image}': {
        imageWidth: 0,
        imageHeight: 0,
        imageContent: '',
    },
    '@:{cell#barcode}': {
        // barcodeWidth: 200,
        // barcodeHeight: 80,
        barcodeLineWidth: 2,
        barcodeColor: '#000000',
        barcodeFormat: 'code128',
        barcodeShowText: true,
        barcodeContent: '',
        barcodeFont: 'tahoma',
        barcodeRender: 'img',
        barcodeFill: 'full',
        barcodeStyleBold: false,
        barcodeStyleItalic: false,
        barcodeTextPosition: 'bottom',
        barcodeTextAlign: 'center',
        barcodeTextMargin: 2,
        barcodeFontsize: 20,
    },
    '@:{cell#qrcode}': {
        // qrcodeWidth: 150,
        // qrcodeHeight: 150,
        qrcodeContent: '',
        qrcodeColorDark: '#000000',
        qrcodeColorLight: '#ffffff',
        qrcodeCorrectLevel: 'H'
    },
    '@:{cell#input}': {
        inputText: '',
        inputPlaceholder: '',
        inputMarkAs: '',
        inputClassName: '',
        inputName: '',
        inputMultiline: false,
        inputFontsize: 14,
        inputFontfamily: 'tahoma',
        inputLetterspacing: 0,
        inputForecolor: '#000000',
        inputTextAlign: 'left'
    },
    '@:{cell#dropdown}': {
        dropdownName: guid('rd-dropdown-'),
        dropdownMarkAs: '',
        dropdownClassName: '',
        dropdownMultipleSelect: false,
        dropdownLetterspacing: 0,
        dropdownItems: [{
            text: '选项',
            disabled: false,
            checked: true,
            value: 'dropdown'
        }],
        dropdownForecolor: '#000000',
        dropdownFontsize: 14,
        dropdownFontfamily: 'tahoma',
    },

    /**
     * 缩放所有单元格
     * @param props 目标属性
     * @param step 缩放步长
     * @param fields 缩放哪些字段
     * @param dest 目标属性
     */
    '@:{cell#stage.scale.cells}'({ rows }, step, fields, dest) {
        for (let row of rows) {
            for (let f of fields) {
                if (row[f] != null) {
                    row[f] *= step;
                }
            }
            for (let col of row.cols) {
                for (let f of fields) {
                    if (col[f] != null) {
                        col[f] *= step;
                    }
                }
                if (col.borderRadius) {
                    col.borderRadius = scaleRadius(col.borderRadius, step);
                }
            }
        }
        if (dest) {
            dest.rows = rows;
        }
    },
    /**
     * 编码单元格的字段
     * @param dest 目标属性
     * @param rows 数据行
     * @param fields 编码哪些字段
     */
    '@:{cell#json.encode.cells}'(dest, rows, fields, toNormalScale) {
        let clonedRows: object[] = []
        for (let row of rows) {
            let clonedRow = {
                ...row,
                cols: []
            };
            for (let f of fields) {
                if (clonedRow[f] != null) {
                    clonedRow[f] = Transform['@:{transform#to.show.value}'](clonedRow[f]);
                }
            }
            for (let col of row.cols) {
                let clonedCol = {
                    ...col
                };
                for (let f of fields) {
                    if (clonedCol[f] != null) {
                        clonedCol[f] = Transform['@:{transform#to.show.value}'](clonedCol[f]);
                    }
                }
                if (clonedCol.borderRadius) {
                    clonedCol.borderRadius = scaleRadius(clonedCol.borderRadius, toNormalScale);
                }
                clonedRow.cols.push(clonedCol);
            }
            clonedRows.push(clonedRow);
        }
        dest.rows = clonedRows;
    },
    /**
     * 转换单元格里的单位
     * @param rows 数据行
     * @param toUnit 目标单位
     * @param fields 转换哪些字段
     */
    '@:{cell#unit.convert.cells}'(rows, toUnit, fields) {
        for (let row of rows) {
            for (let f of fields) {
                if (row[f] != null) {
                    row[f] = Const['@:{const#unit.to.unit}'](row[f], toUnit);
                }
            }
            for (let col of row.cols) {
                for (let f of fields) {
                    if (col[f] != null) {
                        col[f] = Const['@:{const#unit.to.unit}'](col[f], toUnit);
                    }
                }

                if (col.borderRadius) {
                    col.borderRadius = convertRadius(col.borderRadius, toUnit);
                }
            }
        }
    },
    /**
     * 提取圆角信息
     */
    '@:{cell#extract.radius}': extractRadius,
    /**
     * 构建圆角
     */
    '@:{cell#build.radius}': buildRadius,
    /**
     * 缩放圆角
     */
    '@:{cell#scale.radius.part}': scaleRadiusPart,
    /**
     * 缩放圆角字符串
     * @param radius 圆角字符串
     * @param factor 缩放比例
     * @returns 缩放后的圆角
     */
    '@:{cell#scale.radius}': scaleRadius,
    /**
     * 转换圆角单位
     * @param radius 圆角
     * @param toUnit 目标单位
     * @returns 
     */
    '@:{cell#unit.convert.radius}': convertRadius,
};