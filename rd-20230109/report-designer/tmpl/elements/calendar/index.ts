/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Runner from '../../gallery/mx-runner/index';
let { View } = Magix;
let weeks = '日一二三四五六'.split('');
let GetNumOfDays = (year, month) => {
    return 32 - new Date(year, month - 1, 32).getDate();
};
export default View.extend({
    tmpl: '@:index.html',
    init() {
        let update = this.render.bind(this);
        Runner['@:{task.add}'](5 * 60 * 1000, update);
        this.on('destroy', () => {
            Runner['@:{task.remove}'](update);
        });
    },
    assign(data) {
        let weekStart = data.props.weekStart;
        let weekText = weeks.slice(weekStart);
        if (weekStart > 0) {
            weekText = weekText.concat(weeks.slice(0, weekStart));
        }
        this.set(data, {
            weekText,
            weekStart
        });
    },
    render() {
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        now.setHours(0, 0, 0, 0);
        let weekStart = this.get('weekStart');
        let startOffset = (7 - weekStart + new Date(year, month - 1, 1).getDay()) % 7;
        let trs = [],
            tds = [];
        let days = GetNumOfDays(year, month),
            i;
        //let preDays = GetNumOfDays(year, month - 1);
        //let day, date, y;
        for (i = 1; i <= startOffset; i++) {
            //day = preDays - (startOffset - i);
            //date = new Date(year, month - 2, day);
            //y = date.getFullYear();
            tds.push({
                //year: y,
                //month: month - 1,
                //day: day,
                //lunar: getLunarCalendar(y, month, day),
                otherMonth: true
            });
        }
        for (i = 1; i <= days; i++) {
            //date = new Date(year, month - 1, i);
            tds.push({
                year,
                day: i,
                month: month
            });
            if (((i + startOffset) % 7) === 0) {
                trs.push(tds);
                tds = [];
            }
        }
        let fillStart = tds.length; //补充
        if (fillStart) {
            let fillEnd = 7; //2周
            for (i = fillStart; i < fillEnd; i++) {
                //day = i - fillStart + 1;
                //date = new Date(year, month, day);
                tds.push({
                    //month: month + 1,
                    //day: day,
                    //year: date.getFullYear(),
                    otherMonth: true
                });
                if ((i + 1) % 7 === 0) {
                    trs.push(tds);
                    tds = [];
                    if (trs.length == 6) break;
                }
            }
        }
        this.digest({
            year,
            month,
            day,
            weeks: trs
        });
    }
});