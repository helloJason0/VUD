<template>
  <el-date-picker
    :value="dateVal"
    @input="valChange"
    type="daterange"
    v-bind="$attrs"
    size="small"
    :editable="false"
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    :picker-options="pickerOptions"
  >
  </el-date-picker>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component({
  model: { prop: 'value', event: 'change' }
})
export default class DatePicker extends Vue {
  name = 'DatePicker';

  @Prop({ type: Array, default: () => [] })
  /** 数据 */
  readonly value!: string[];

  @Prop({ type: String, default: 'YYYY-MM-DD' })
  /** 数据的格式 */
  readonly format!: string;

  @Prop({ type: Number, default: 0 })
  /** 范围的最长的长度 */
  readonly dateLength!: number;

  @Prop({
    type: Number,
    default: Number(dayjs('20171024', 'YYYYMMDD').valueOf())
  })
  /** 能选择的最小日期 */
  readonly minDate?: number;

  @Prop({ type: Number })
  /** 能选择的最大日期 */
  readonly maxDate?: number;

  @Prop({ type: Array, default: () => [] })
  /** 屏蔽的日期列表 */
  readonly disabledDateList!: string[];

  @Prop({ type: String, default: 'YYYYMMDD' })
  /** 屏蔽日期的列表格式 */
  readonly disableFormat!: string;

  @Prop({ type: String, default: 'continuity' })
  /** 值的类型 */
  readonly valueType!: 'dispersed' | 'continuity';

  @Prop({ type: Boolean, default: false })
  /** 是否显示快捷选项 */
  readonly showShortcuts!: boolean;

  get dateVal (): Date[] {
    const { value = [] } = this
    if (value.length >= 2) {
      return [dayjs(value[0]).toDate(), dayjs(value[value.length - 1]).toDate()]
    } else {
      return []
    }
  }

  private tmpThat = {
    maxDate: null as Date | null,
    minDate: null as Date | null
  };

  get pickerOptions () {
    const TIMELIMIT = dayjs(this.minDate).toDate();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    return {
      disabledDate (time: Date) {
        const selectMoment = dayjs(time);
        const selectDate = selectMoment.format(that.disableFormat);
        const { disabledDateList, dateLength } = that;
        /** 当前时间的时间戳 */
        const selectTime = Number(selectMoment.valueOf());
        if (that.maxDate && selectTime > that.maxDate) {
          return true;
        }
        if (that.minDate && selectTime < that.minDate) {
          return true;
        }
        // 屏蔽的列表
        if (disabledDateList.includes(selectDate)) {
          return true;
        }
        const { maxDate, minDate } = that.tmpThat;
        if (maxDate && minDate) {
          return false;
        }
        const compareVal = minDate || maxDate;
        if (dateLength && compareVal) {
          const compareTime = compareVal.getTime();
          const length = dateLength * 24 * 3600 * 1000;
          if (
            selectTime < compareTime - length ||
            selectTime > compareTime + length
          ) {
            return true;
          }
          const compareArr = [
            dayjs(compareVal).format(that.disableFormat),
            selectDate
          ].sort();
          // 遍历一下，如果这之间有一天在屏蔽列表中，那么就屏蔽了这天
          if (
            disabledDateList.some(
              (ele) =>
                Number(compareArr[0]) < Number(ele) &&
                Number(ele) < Number(compareArr[1])
            )
          ) {
            return true;
          }
        }
        return false;
      },
      onPick (time: typeof that.tmpThat) {
        Object.assign(that.tmpThat, time);
      },
      shortcuts: that.showShortcuts ? [
        {
          text: '最近一周',
          onClick (picker: Vue) {
            const end = new Date();
            let start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            start = start >= TIMELIMIT ? start : TIMELIMIT;
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: '最近一个月',
          onClick (picker: Vue) {
            const end = new Date();
            let start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            start = start >= TIMELIMIT ? start : TIMELIMIT;
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: '最近三个月',
          onClick (picker: Vue) {
            const end = new Date();
            let start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            start = start >= TIMELIMIT ? start : TIMELIMIT;
            picker.$emit('pick', [start, end]);
          }
        }
      ] : undefined
    };
  }

  valChange (val: Date[]) {
    const tempRes = [...(val || [])].map((item) => dayjs(item).startOf('d'));
    let res: string[] = [];
    if (this.valueType === 'dispersed' && tempRes.length >= 2) {
      let [start] = tempRes;
      const [, end] = tempRes;
      res = [];
      while (end.diff(start) >= 0) {
        res.push(start.format(this.format));
        start = start.add(1, 'd');
      }
    } else {
      res = tempRes.map((item) => dayjs(item).format(this.format));
    }
    this.$emit('change', res);
  }
}
</script>

<style>
</style>
