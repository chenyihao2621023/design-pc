import Magix from 'magix5';
import Load from './loader';
let { config, has } = Magix;
let providers = config<Report.ProviderURLConfig>('providers');
let base = providers?.bwip || '//unpkg.com/bwip-js@3.1.0/dist/';
let dest = [base + 'bwip-js-min.js'];
//https://raw.githubusercontent.com/metafloor/bwip-js/master/examples/drawing-svg.js
let DrawingSVG = (opts, FontLib) => {
    // Unrolled x,y rotate/translate matrix
    var tx0 = 0, tx1 = 0, tx2 = 0, tx3 = 0;
    var ty0 = 0, ty1 = 0, ty2 = 0, ty3 = 0;

    var svg = '';
    var path;
    var lines = {};

    // Magic number to approximate an ellipse/circle using 4 cubic beziers.
    var ELLIPSE_MAGIC = 0.55228475 - 0.00045;

    // Global graphics state
    var gs_width, gs_height;    // image size, in pixels
    var gs_dx, gs_dy;           // x,y translate (padding)

    return {
        // Make no adjustments
        scale(sx, sy) {
        },
        clip() {

        },
        unclip() {

        },
        // Measure text.  This and scale() are the only drawing primitives that
        // are called before init().
        //
        // `font` is the font name typically OCR-A or OCR-B.
        // `fwidth` and `fheight` are the requested font cell size.  They will
        // usually be the same, except when the scaling is not symetric.
        measure(str, font, fwidth, fheight) {
            fwidth = fwidth | 0;
            fheight = fheight | 0;

            var fontid = FontLib.lookup(font);
            var width = 0;
            var ascent = 0;
            var descent = 0;
            for (var i = 0; i < str.length; i++) {
                var ch = str.charCodeAt(i);
                var glyph = FontLib.getpaths(fontid, ch, fwidth, fheight);
                if (!glyph) {
                    continue;
                }
                ascent = Math.max(ascent, glyph.ascent);
                descent = Math.max(descent, -glyph.descent);
                width += glyph.advance;
            }
            return { width, ascent, descent };
        },

        // width and height represent the maximum bounding box the graphics will occupy.
        // The dimensions are for an unrotated rendering.  Adjust as necessary.
        init(width, height) {
            // Add in the effects of padding.  These are always set before the
            // drawing constructor is called.
            var padl = opts.paddingleft;
            var padr = opts.paddingright;
            var padt = opts.paddingtop;
            var padb = opts.paddingbottom;
            var rot = opts.rotate || 'N';

            width += padl + padr;
            height += padt + padb;

            // Transform indexes are: x, y, w, h
            switch (rot) {
                // tx = w-y, ty = x
                case 'R': tx1 = -1; tx2 = 1; ty0 = 1; break;
                // tx = w-x, ty = h-y
                case 'I': tx0 = -1; tx2 = 1; ty1 = -1; ty3 = 1; break;
                // tx = y, ty = h-x
                case 'L': tx1 = 1; ty0 = -1; ty3 = 1; break;
                // tx = x, ty = y
                default: tx0 = ty1 = 1; break;
            }

            // Setup the graphics state
            var swap = rot == 'L' || rot == 'R';
            gs_width = swap ? height : width;
            gs_height = swap ? width : height;
            gs_dx = padl;
            gs_dy = padt;

            svg = '';
        },
        // Unconnected stroked lines are used to draw the bars in linear barcodes.
        // No line cap should be applied.  These lines are always orthogonal.
        line(x0, y0, x1, y1, lw, rgb) {
            // Try to get non-blurry lines...
            x0 = x0 | 0;
            y0 = y0 | 0;
            x1 = x1 | 0;
            y1 = y1 | 0;
            lw = Math.round(lw);

            // Try to keep the lines "crisp" by using with the SVG line drawing spec to
            // our advantage.
            if (lw & 1) {
                if (x0 == x1) {
                    x0 += 0.5;
                    x1 += 0.5;
                }
                if (y0 == y1) {
                    y0 += 0.5;
                    y1 += 0.5;
                }
            }

            // Group together all lines of the same width and emit as single paths.
            // Dramatically reduces resulting text size.
            var key = lw + '#' + rgb;
            if (!lines[key]) {
                lines[key] = '<path stroke="#' + rgb + '" stroke-width="' + lw + '" d="';
            }
            lines[key] += 'M' + transform(x0, y0) + 'L' + transform(x1, y1);
        },
        // Polygons are used to draw the connected regions in a 2d barcode.
        // These will always be unstroked, filled, non-intersecting,
        // orthogonal shapes.
        // You will see a series of polygon() calls, followed by a fill().
        polygon(pts) {
            if (!path) {
                path = '<path d="';
            }
            path += 'M' + transform(pts[0][0], pts[0][1]);
            for (var i = 1, n = pts.length; i < n; i++) {
                var p = pts[i];
                path += 'L' + transform(p[0], p[1]);
            }
            path += 'Z';
        },
        // An unstroked, filled hexagon used by maxicode.  You can choose to fill
        // each individually, or wait for the final fill().
        //
        // The hexagon is drawn from the top, counter-clockwise.
        hexagon(pts) {
            this.polygon(pts); // A hexagon is just a polygon...
        },
        // An unstroked, filled ellipse.  Used by dotcode and maxicode at present.
        // maxicode issues pairs of ellipse calls (one cw, one ccw) followed by a fill()
        // to create the bullseye rings.  dotcode issues all of its ellipses then a
        // fill().
        ellipse(x, y, rx, ry, ccw) {
            if (!path) {
                path = '<path d="';
            }
            var dx = rx * ELLIPSE_MAGIC;
            var dy = ry * ELLIPSE_MAGIC;

            // Since we fill with even-odd, don't worry about cw/ccw
            path += 'M' + transform(x - rx, y) +
                'C' + transform(x - rx, y - dy) + ' ' +
                transform(x - dx, y - ry) + ' ' +
                transform(x, y - ry) +
                'C' + transform(x + dx, y - ry) + ' ' +
                transform(x + rx, y - dy) + ' ' +
                transform(x + rx, y) +
                'C' + transform(x + rx, y + dy) + ' ' +
                transform(x + dx, y + ry) + ' ' +
                transform(x, y + ry) +
                'C' + transform(x - dx, y + ry) + ' ' +
                transform(x - rx, y + dy) + ' ' +
                transform(x - rx, y) +
                'Z';
        },
        // PostScript's default fill rule is even-odd.
        fill(rgb) {
            if (path) {
                svg += path + '" fill="#' + rgb + '" fill-rule="evenodd" />';
                path = null;
            }
        },
        // Draw text with optional inter-character spacing.  `y` is the baseline.
        // font is an object with properties { name, width, height, dx }
        // width and height are the font cell size.
        // dx is extra space requested between characters (usually zero).
        text(x, y, str, rgb, font) {
            var fontid = FontLib.lookup(font.name);
            var fwidth = font.width | 0;
            var fheight = font.height | 0;
            var dx = font.dx | 0;
            var path = '';
            for (var k = 0; k < str.length; k++) {
                var ch = str.charCodeAt(k);
                var glyph = FontLib.getpaths(fontid, ch, fwidth, fheight);
                if (!glyph) {
                    continue;
                }
                if (glyph.length) {
                    // A glyph is composed of sequence of curve and line segments.
                    // M is move-to
                    // L is line-to
                    // Q is quadratic bezier curve-to
                    // C is cubic bezier curve-to
                    for (var i = 0, l = glyph.length; i < l; i++) {
                        let seg = glyph[i];
                        if (seg.type == 'M' || seg.type == 'L') {
                            path += seg.type + transform(seg.x + x, y - seg.y);
                        } else if (seg.type == 'Q') {
                            path += seg.type + transform(seg.cx + x, y - seg.cy) + ' ' +
                                transform(seg.x + x, y - seg.y);
                        } else if (seg.type == 'C') {
                            path += seg.type + transform(seg.cx1 + x, y - seg.cy1) + ' ' +
                                transform(seg.cx2 + x, y - seg.cy2) + ' ' +
                                transform(seg.x + x, y - seg.y);
                        }
                    }
                    // Close the shape
                    path += 'Z';
                }
                x += glyph.advance + dx;
            }
            if (path) {
                svg += '<path d="' + path + '" fill="#' + rgb + '" />';
            }
        },
        // Called after all drawing is complete.  The return value from this method
        // is the return value from `bwipjs.render()`.
        end() {
            var linesvg = '';
            for (var key in lines) {
                linesvg += lines[key] + '" />';
            }
            var bg = opts.backgroundcolor;
            return '<svg style="width:100%;height:100%" viewBox="0 0 ' + gs_width + ' ' + gs_height + '">' +
                (/^[0-9A-Fa-f]{6}$/.test(bg)
                    ? '<rect width="100%" height="100%" fill="#' + bg + '" />'
                    : '') +
                linesvg + svg + '</svg>';
        },
    };

    // translate/rotate and return as an SVG coordinate pair
    function transform(x, y) {
        x += gs_dx;
        y += gs_dy;
        var tx = tx0 * x + tx1 * y + tx2 * (gs_width - 1) + tx3 * (gs_height - 1);
        var ty = ty0 * x + ty1 * y + ty2 * (gs_width - 1) + ty3 * (gs_height - 1);
        return ((tx | 0) == tx ? tx : tx.toFixed(2)) + ' ' +
            ((ty | 0) == ty ? ty : ty.toFixed(2));
    }
};
let loaded;
let noTextOptions = {
    qrcode: 1,
    microqrcode: 1,
    rectangularmicroqrcode: 1,
    azteccode: 1,
    aztecrune: 1,
    azteccodecompact: 1,
    pdf417compact: 1,
    datamatrix: 1,
    datamatrixrectangular: 1,
    datamatrixrectangularextension: 1,
    hanxin: 1,
    micropdf417: 1,
    pdf417: 1,
    swissqrcode: 1,
    ultracode: 1,
    gs1datamatrix: 1,
    gs1datamatrixrectangular: 1,
    gs1dotcode: 1,
    gs1qrcode: 1,
    databarexpanded: 1,
    databarexpandedstacked: 1,
    databarstacked: 1,
    databarstackedomni: 1,
    maxicode: 1,
    symbol: 1,
    mailmark: 1,
    hibcazteccode: 1,
    hibccodablockf: 1,
    hibcdatamatrix: 1,
    hibcdatamatrixrectangular: 1,
    hibcmicropdf417: 1,
    hibcpdf417: 1,
    hibcqrcode: 1,
    codablockf: 1,
    code16k: 1,
    code49: 1,
    codeone: 1,
    dotcode: 1,
    databarexpandedstackedcomposite: 1,
    databarexpandedcomposite: 1,
    databarstackedcomposite: 1,
    databarstackedomnicomposite: 1,
    raw: 1,
    daft: 1,
    'gs1-cc': 1,
};
export default {
    '@:{types}': [{
        value: "ean5",
        text: "EAN-5 (5 digit addon)",
        fill: "90200",
        opts: "includetext guardwhitespace"
    }, {
        value: "ean2",
        text: "EAN-2 (2 digit addon)",
        fill: "05",
        opts: "includetext guardwhitespace"
    }, {
        value: "ean13",
        text: "EAN-13",
        fill: "2112345678900",
        opts: "includetext guardwhitespace"
    }, {
        value: "ean8",
        text: "EAN-8",
        fill: "02345673",
        opts: "includetext guardwhitespace"
    }, {
        value: "upca",
        text: "UPC-A",
        fill: "416000336108",
        opts: "includetext"
    }, {
        value: "upce",
        text: "UPC-E",
        fill: "00123457",
        opts: "includetext"
    }, {
        value: "isbn",
        text: "ISBN",
        fill: "978-1-56581-231-4 90000",
        opts: "includetext guardwhitespace"
    }, {
        value: "ismn",
        text: "ISMN",
        fill: "979-0-2605-3211-3",
        opts: "includetext guardwhitespace"
    }, {
        value: "issn",
        text: "ISSN",
        fill: "0311-175X 00 17",
        opts: "includetext guardwhitespace"
    }, {
        value: "code128",
        text: "Code 128",
        fill: "Count01234567!",
        opts: "includetext"
    }, {
        value: "gs1-128",
        text: "GS1-128",
        fill: "(01)95012345678903(3103)000123",
        opts: "includetext"
    }, {
        value: "ean14",
        text: "GS1-14",
        fill: "(01) 0 46 01234 56789 3",
        opts: "includetext"
    }, {
        value: "sscc18",
        text: "SSCC-18",
        fill: "(00) 0 0614141 123456789 0",
        opts: "includetext"
    }, {
        value: "code39",
        text: "Code 39",
        fill: "THIS IS CODE 39",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "code39ext",
        text: "Code 39 Extended",
        fill: "Code39 Ext!",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "code32",
        text: "Italian Pharmacode",
        fill: "01234567",
        opts: "includetext"
    }, {
        value: "pzn",
        text: "Pharmazentralnummer (PZN)",
        fill: "123456",
        opts: "includetext"
    }, {
        value: "code93",
        text: "Code 93",
        fill: "THIS IS CODE 93",
        opts: "includetext includecheck"
    }, {
        value: "code93ext",
        text: "Code 93 Extended",
        fill: "Code93 Ext!",
        opts: "includetext includecheck"
    }, {
        value: "interleaved2of5",
        text: "Interleaved 2 of 5 (ITF)",
        fill: "2401234567",
        opts: "height=12 includecheck includetext includecheckintext"
    }, {
        value: "itf14",
        text: "ITF-14",
        fill: "0 46 01234 56789 3",
        opts: "includetext"
    }, {
        value: "identcode",
        text: "Deutsche Post Identcode",
        fill: "563102430313",
        opts: "includetext"
    }, {
        value: "leitcode",
        text: "Deutsche Post Leitcode",
        fill: "21348075016401",
        opts: "includetext"
    }, {
        value: "databaromni",
        text: "GS1 DataBar Omnidirectional",
        fill: "(01)24012345678905",
    }, {
        value: "databarstacked",
        text: "GS1 DataBar Stacked",
        fill: "(01)24012345678905",
    }, {
        value: "databarstackedomni",
        text: "GS1 DataBar Stacked Omnidirectional",
        fill: "(01)24012345678905",
    }, {
        value: "databartruncated",
        text: "GS1 DataBar Truncated",
        fill: "(01)24012345678905",
    }, {
        value: "databarlimited",
        text: "GS1 DataBar Limited",
        fill: "(01)15012345678907",
    }, {
        value: "databarexpanded",
        text: "GS1 DataBar Expanded",
        fill: "(01)95012345678903(3103)000123",
    }, {
        value: "databarexpandedstacked",
        text: "GS1 DataBar Expanded Stacked",
        fill: "(01)95012345678903(3103)000123",
        opts: "segments=4"
    }, {
        value: "gs1northamericancoupon",
        text: "GS1 North American Coupon",
        fill: "(8110)106141416543213500110000310123196000",
        opts: "includetext segments=8"
    }, {
        value: "pharmacode",
        text: "Pharmaceutical Binary Code",
        fill: "117480",
        opts: "showborder"
    }, {
        value: "pharmacode2",
        text: "Two-track Pharmacode",
        fill: "117480",
        opts: "includetext showborder"
    }, {
        value: "code2of5",
        text: "Code 25",
        fill: "01234567",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "industrial2of5",
        text: "Industrial 2 of 5",
        fill: "01234567",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "iata2of5",
        text: "IATA 2 of 5",
        fill: "01234567",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "matrix2of5",
        text: "Matrix 2 of 5",
        fill: "01234567",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "coop2of5",
        text: "COOP 2 of 5",
        fill: "01234567",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "datalogic2of5",
        text: "Datalogic 2 of 5",
        fill: "01234567",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "code11",
        text: "Code 11",
        fill: "0123456789",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "bc412",
        text: "BC412",
        fill: "BC412",
        opts: "semi includetext includecheckintext"
    }, {
        value: "rationalizedCodabar",
        text: "Codabar",
        fill: "A0123456789B",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "onecode",
        text: "USPS Intelligent Mail",
        fill: "0123456709498765432101234567891",
        opts: "barcolor=FF0000"
    }, {
        value: "postnet",
        text: "USPS POSTNET",
        fill: "01234",
        opts: "includetext includecheckintext"
    }, {
        value: "planet",
        text: "USPS PLANET",
        fill: "01234567890",
        opts: "includetext includecheckintext"
    }, {
        value: "royalmail",
        text: "Royal Mail 4 State Customer Code",
        fill: "LE28HS9Z",
        opts: "includetext barcolor=FF0000"
    }, {
        value: "auspost",
        text: "AusPost 4 State Customer Code",
        fill: "5956439111ABA 9",
        opts: "includetext custinfoenc=character"
    }, {
        value: "kix",
        text: "Royal Dutch TPG Post KIX",
        fill: "1231FZ13XHS",
        opts: "includetext"
    }, {
        value: "japanpost",
        text: "Japan Post 4 State Customer Code",
        fill: "6540123789-A-K-Z",
        opts: "includetext includecheckintext"
    }, {
        value: "msi",
        text: "MSI Modified Plessey",
        fill: "0123456789",
        opts: "includetext includecheck includecheckintext"
    }, {
        value: "plessey",
        text: "Plessey UK",
        fill: "01234ABCD",
        opts: "includetext includecheckintext"
    }, {
        value: "telepen",
        text: "Telepen",
        fill: "ABCDEF",
        opts: "includetext"
    }, {
        value: "telepennumeric",
        text: "Telepen Numeric",
        fill: "01234567",
        opts: "includetext"
    }, {
        value: "posicode",
        text: "PosiCode",
        fill: "ABC123",
        opts: "version=b inkspread=-0.5 parsefnc includetext"
    }, {
        value: "codablockf",
        text: "Codablock F",
        fill: "CODABLOCK F 34567890123456789010040digit",
        opts: "columns=8"
    }, {
        value: "code16k",
        text: "Code 16K",
        fill: "Abcd-1234567890-wxyZ",
    }, {
        value: "code49",
        text: "Code 49",
        fill: "MULTIPLE ROWS IN CODE 49",
    }, {
        value: "channelcode",
        text: "Channel Code",
        fill: "3493",
        opts: "height=12 includetext"
    }, {
        value: "flattermarken",
        text: "Flattermarken",
        fill: "11099",
        opts: "inkspread=-0.25 showborder borderleft=0 borderright=0"
    }, {
        value: "raw",
        text: "Custom 1D symbology",
        fill: "331132131313411122131311333213114131131221323",
        opts: "height=12"
    }, {
        value: "daft",
        text: "Custom 4 state symbology",
        fill: "FATDAFTDAD",
    }, {
        value: "symbol",
        text: "Miscellaneous symbols",
        fill: "fima",
        opts: "backgroundcolor=DD000011"
    }, {
        value: "pdf417",
        text: "PDF417",
        fill: "This is PDF417",
        opts: "columns=2"
    }, {
        value: "pdf417compact",
        text: "Compact PDF417",
        fill: "This is compact PDF417",
        opts: "columns=2"
    }, {
        value: "micropdf417",
        text: "MicroPDF417",
        fill: "MicroPDF417",
    }, {
        value: "datamatrix",
        text: "Data Matrix",
        fill: "This is Data Matrix!",
    }, {
        value: "datamatrixrectangular",
        text: "Data Matrix Rectangular",
        fill: "1234",
    }, {
        value: "datamatrixrectangularextension",
        text: "Data Matrix Rectangular Extension",
        fill: "1234",
        opts: "version=8x96"
    }, {
        value: "mailmark",
        text: "Royal Mail Mailmark",
        fill: "JGB 012100123412345678AB19XY1A 0             www.xyz.com",
        opts: "type=29"
    }, {
        value: "qrcode",
        text: "QR Code",
        fill: "http://goo.gl/0bis",
        opts: "eclevel=M"
    }, {
        value: "swissqrcode",
        text: "Swiss QR Code",
        fill: "",
    }, {
        value: "microqrcode",
        text: "Micro QR Code",
        fill: "1234",
    }, {
        value: "rectangularmicroqrcode",
        text: "Rectangular Micro QR Code",
        fill: "1234",
        opts: "version=R17x139"
    }, {
        value: "maxicode",
        text: "MaxiCode",
        fill: "[)>^03001^02996152382802^029840^029001^0291Z00004951^029UPSN^02906X610^029159^0291234567^0291/1^029^029Y^029634 ALPHA DR^029PITTSBURGH^029PA^029^004",
        opts: "mode=2 parse"
    }, {
        value: "azteccode",
        text: "Aztec Code",
        fill: "This is Aztec Code",
        opts: "format=full"
    }, {
        value: "azteccodecompact",
        text: "Compact Aztec Code",
        fill: "1234",
    }, {
        value: "aztecrune",
        text: "Aztec Runes",
        fill: "1",
    }, {
        value: "codeone",
        text: "Code One",
        fill: "Code One",
    }, {
        value: "hanxin",
        text: "Han Xin Code",
        fill: "This is Han Xin",
    }, {
        value: "dotcode",
        text: "DotCode",
        fill: "This is DotCode",
        opts: "inkspread=0.16"
    }, {
        value: "ultracode",
        text: "Ultracode",
        fill: "Awesome colours!",
        opts: "eclevel=EC2"
    }, {
        value: "gs1-cc",
        text: "GS1 Composite 2D Component",
        fill: "(01)95012345678903(3103)000123",
        opts: "ccversion=b cccolumns=4"
    }, {
        value: "ean13composite",
        text: "EAN-13 Composite",
        fill: "2112345678900|(99)1234-abcd",
        opts: "includetext"
    }, {
        value: "ean8composite",
        text: "EAN-8 Composite",
        fill: "02345673|(21)A12345678",
        opts: "includetext"
    }, {
        value: "upcacomposite",
        text: "UPC-A Composite",
        fill: "416000336108|(99)1234-abcd",
        opts: "includetext"
    }, {
        value: "upcecomposite",
        text: "UPC-E Composite",
        fill: "00123457|(15)021231",
        opts: "includetext"
    }, {
        value: "databaromnicomposite",
        text: "GS1 DataBar Omnidirectional Composite",
        fill: "(01)03612345678904|(11)990102",
    }, {
        value: "databarstackedcomposite",
        text: "GS1 DataBar Stacked Composite",
        fill: "(01)03412345678900|(17)010200",
    }, {
        value: "databarstackedomnicomposite",
        text: "GS1 DataBar Stacked Omnidirectional Composite",
        fill: "(01)03612345678904|(11)990102",
    }, {
        value: "databartruncatedcomposite",
        text: "GS1 DataBar Truncated Composite",
        fill: "(01)03612345678904|(11)990102",
    }, {
        value: "databarlimitedcomposite",
        text: "GS1 DataBar Limited Composite",
        fill: "(01)03512345678907|(21)abcdefghijklmnopqrst",
    }, {
        value: "databarexpandedcomposite",
        text: "GS1 DataBar Expanded Composite",
        fill: "(01)93712345678904(3103)001234|(91)1A2B3C4D5E",
    }, {
        value: "databarexpandedstackedcomposite",
        text: "GS1 DataBar Expanded Stacked Composite",
        fill: "(01)00012345678905(10)ABCDEF|(21)12345678",
        opts: "segments=4"
    }, {
        value: "gs1-128composite",
        text: "GS1-128 Composite",
        fill: "(00)030123456789012340|(02)13012345678909(37)24(10)1234567ABCDEFG",
        opts: "ccversion=c"
    }, {
        value: "gs1datamatrix",
        text: "GS1 Data Matrix",
        fill: "(01)03453120000011(17)120508(10)ABCD1234(410)9501101020917",
    }, {
        value: "gs1datamatrixrectangular",
        text: "GS1 Data Matrix Rectangular",
        fill: "(01)03453120000011(17)120508(10)ABCD1234(410)9501101020917",
    }, {
        value: "gs1qrcode",
        text: "GS1 QR Code",
        fill: "(01)03453120000011(8200)http://www.abc.net(10)ABCD1234(410)9501101020917",
    }, {
        value: "gs1dotcode",
        text: "GS1 DotCode",
        fill: "(235)5vBZIF%!<B;?oa%(01)01234567890128(8008)19052001",
        opts: "rows=16"
    }, {
        value: "hibccode39",
        text: "HIBC Code 39",
        fill: "A123BJC5D6E71",
        opts: "includetext"
    }, {
        value: "hibccode128",
        text: "HIBC Code 128",
        fill: "A123BJC5D6E71",
        opts: "includetext"
    }, {
        value: "hibcdatamatrix",
        text: "HIBC Data Matrix",
        fill: "A123BJC5D6E71",
    }, {
        value: "hibcdatamatrixrectangular",
        text: "HIBC Data Matrix Rectangular",
        fill: "A123BJC5D6E71",
    }, {
        value: "hibcpdf417",
        text: "HIBC PDF417",
        fill: "A123BJC5D6E71",
    }, {
        value: "hibcmicropdf417",
        text: "HIBC MicroPDF417",
        fill: "A123BJC5D6E71",
    }, {
        value: "hibcqrcode",
        text: "HIBC QR Code",
        fill: "A123BJC5D6E71",
    }, {
        value: "hibccodablockf",
        text: "HIBC Codablock F",
        fill: "A123BJC5D6E71",
    }, {
        value: "hibcazteccode",
        text: "HIBC Aztec Code",
        fill: "A123BJC5D6E71",
    }],
    '@:{no.text.options}': noTextOptions,
    '@:{is.loaded}'() {
        return loaded;
    },
    async '@:{load.library}'() {
        try {
            await Load('bwipjs', dest);
        } finally {
            loaded = 1;
        }
        if (window.bwipjs &&
            !bwipjs.toSVG) {
            bwipjs.toSVG = (opts, params = '') => {
                try {
                    let ps = params.split(/\s+/);
                    for (let p of ps) {
                        let [key, value] = p.split('=');
                        if (!has(opts, key)) {
                            opts[key] = value ?? true;
                        }
                    }
                    bwipjs.fixupOptions(opts);
                    return bwipjs.render(opts, DrawingSVG(opts, bwipjs.FontLib));
                } catch (ex) {
                    return ex.message;
                }
            };
        }
    }
};