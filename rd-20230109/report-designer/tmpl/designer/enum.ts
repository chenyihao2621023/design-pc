/**
 * 枚举对象
 */
export default {
    //角色类型
    '@:{enum#as.hod}': 1,//容器
    '@:{enum#as.data.hod}': 2,//数据绑定容器
    '@:{enum#as.cells}': 4,//带有单元格的元素
    //对齐
    '@:{enum#align.line.coners}': 1,//拐角
    '@:{enum#align.line.middles}': 2,//四条边线的中间点
    /**
     * 中心点对齐时，因元素可能放在容器里，故最终通过DOM节点读取元素的位置信息
     * 通过DOM节点读取位置信息时，有误差，比如两个相同元素，其中一个旋转1度，另外一个不旋转
     * 理论上这2个在对齐时，因为绕中心点旋转，中心点是不动的，中心点应该优先对齐，但因为通过
     * DOM读取误差的存在，会导致中心点并不是优先对齐的，该bug不修复
     */
    '@:{enum#align.centers}': 2 << 1,//元素中间点
    //拖动对齐跟随元素
    '@:{enum#follow.align.grouped}': 1,//组合中的元素
    '@:{enum#follow.align.selected}': 2,//选中的元素
    //修改器类型
    '@:{enum#modifier.icon}': 1,//修改指示图标
    '@:{enum#modifier.size}': 2,//修改指示尺寸
    '@:{enum#modifier.width}': 2 << 1,//宽
    '@:{enum#modifier.height}': 2 << 2,//高
    '@:{enum#modifier.protate}': 2 << 3,//点旋转
    '@:{enum#modifier.rotate}': 2 << 4,//旋转
    '@:{enum#modifier.nomask}': 2 << 5,//无遮盖
    '@:{enum#modifier.inputext}': 2 << 6,//快捷文本输入
    //'@:{enum#modifier.dblclick}': 2 << 7,//双击功能
    '@:{enum#modifier.dheight}': 2 << 7,//动态高度
    '@:{enum#modifier.sync.size}': 2 << 8,//修改元素的其中一个尺寸时(如宽)，同步另外的尺寸(如高)
    '@:{enum#modifier.selected.show.icon}': 2 << 9,//选中显示icon
    '@:{enum#modifier.top.icon}': 2 << 10,//顶部显示icon
    '@:{enum#modifier.linkage}': 2 << 11,//是否需要联动

    //属性面板通用组件
    '@:{enum#prop.number}': 1,//数字输入框
    '@:{enum#prop.color}': 2,//颜色
    '@:{enum#prop.boolean}': 3,//布尔值
    '@:{enum#prop.text.area}': 4,//textarea输入框
    '@:{enum#prop.collection}': 6,//下拉框
    '@:{enum#prop.image.reset}': 7,//图片重置
    '@:{enum#prop.text.input}': 8,//input输入框
    '@:{enum#prop.label}': 9,//仅显示
    '@:{enum#prop.spliter}': 10,//分割线
    '@:{enum#prop.link}': 11,//链接
    '@:{enum#prop.number.pair}': 12,//数字范围输入框
    //以下是特殊定制的组件
    '@:{enum#prop.image}': 'picture/index',//图片
    '@:{enum#prop.align}': 'align/index',//对齐
    '@:{enum#prop.font.align}': 'font/align',//输入框文字对齐方式
    '@:{enum#prop.font.style}': 'font/style',//字体样式
    '@:{enum#prop.bind.field}': 'field/index',//绑定字段
    '@:{enum#prop.format}': 'format/index',//格式化
    '@:{enum#prop.format.fx}': 'format/fx',//显示控制的函数
    '@:{enum#prop.color.series}': 'color/series',//配色
    '@:{enum#prop.table.cell.content}': 'table/content',//表格格子内容
    '@:{enum#prop.table.cell.operate}': 'table/operate',//表格单元格操作
    '@:{enum#prop.table.cell.border}': 'table/border',//表格边框
    '@:{enum#prop.table.cell.size}': 'table/size',//表格格子尺寸
    '@:{enum#prop.table.cell.share}': 'table/share',//均分宽高
    '@:{enum#prop.cell.style}': 'box/style',//格子样式
    '@:{enum#prop.cell.radius}': 'box/radius',
    '@:{enum#prop.cell.border}': 'box/border',
    '@:{enum#prop.cell.h.operate}': 'box/h-operate',//水平格子操作
    '@:{enum#prop.cell.v.operate}': 'box/v-operate',//垂直格子操作
    '@:{enum#prop.cell.h.size}': 'box/h-size',//水平格子尺寸
    '@:{enum#prop.cell.v.size}': 'box/v-size',//垂直格子尺寸
    '@:{enum#prop.table.style}': 'table/style',//表格皮肤
    '@:{enum#prop.column.width}': 'column/index',//列宽
    '@:{enum#prop.form.items}': 'form/items',//多选或下拉框对应的数组输入
    '@:{enum#prop.form.collect.cell.operate}': 'ctable/operate',//数据采集表格格子操作
    '@:{enum#prop.form.collect.cell.content}': 'ctable/content',//数据采集表格格子内容
    '@:{enum#prop.dtable.cell.operate}': 'dtable/operate',//数据表格格子操作
    '@:{enum#prop.dtable.cell.content}': 'dtable/content',//数据表格格子内容
    '@:{enum#prop.ftable.cell.operate}': 'ftable/operate',//容器列表格格子操作
    '@:{enum#prop.fx.expression}': 'fx/index',//函数表达式
    '@:{enum#prop.fx.help}': 'fx/help',//函数辅助线
    '@:{enum#prop.svg.key.point}': 'svg/kp',//svg关键点
    '@:{enum#prop.svg.mod.point}': 'svg/mod',//svg修改点
    '@:{enum#prop.box.tabs}': 'tab/index',//tab
    '@:{enum#prop.box.tags}': 'tag/index',//tags
    '@:{enum#prop.unicolor}': 'baw/index',//黑白反色
    '@:{enum#prop.number.rule}': 'rule/index',//数字规则
    '@:{enum#prop.mset}': 'mset/index',//沙箱
    '@:{enum#prop.cond.image}': 'crule/index',//条件图片
    '@:{enum#prop.cond.light}': 'lrule/index',//提示灯
    '@:{enum#prop.bind.roost}': 'field/roost',//占位数据绑定
    '@:{enum#prop.pbtn.image}': 'pbtn/index',//触压按钮
    '@:{enum#prop.swiper.rule}': 'srule/index',//轮播规则
};