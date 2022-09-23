<template>
  <el-date-picker
    v-model="dateVal"
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

<script>
import dayjs from 'dayjs';

export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    /** 数据 */
    value: {
      type: Array,
      default: () => [],
    },
    /** 数据的格式 */
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    /** 范围的最长的长度 */
    dateLength: {
      type: Number,
      default: 0,
    },
    /** 能选择的最小日期 */
    minDate: {
      type: Number,
      default: () => Number(dayjs('20171024', 'YYYYMMDD').valueOf()),
    },
    /** 能选择的最大日期 */
    maxDate: {
      type: Number,
      default: () => Number(dayjs().valueOf()),
    },
    /** 屏蔽的日期列表 */
    disabledDateList: {
      type: Array,
      default: () => [],
    },
    /** 屏蔽日期的列表格式 */
    disableFormat: {
      type: String,
      default: 'YYYYMMDD',
    },
    /**
     * 值的类型，
     * @type {'dispersed' | 'continuity' }
     */
    valueType: {
      type: String,
      default: 'continuity',
    },
  },
  data() {
    const TIMELIMIT = dayjs(this.minDate).$d;
    const that = this;
    const tmpThat = {
      maxDate: null,
      minDate: null,
    };
    return {
      pickerOptions: {
        disabledDate(time) {
          const selectMoment = dayjs(time);
          const selectDate = selectMoment.format(that.disableFormat);
          /** 当前时间的时间戳 */
          const selectTime = Number(selectMoment.valueOf());
          if (that.maxDate && selectTime > that.maxDate) {
            return true;
          }
          if (that.minDate && selectTime < that.minDate) {
            return true;
          }
          // 屏蔽的列表
          if (that.disabledDateList.includes(selectDate)) {
            return true;
          }
          const { maxDate, minDate } = tmpThat;
          if (maxDate && minDate) {
            return false;
          }
          if (that.dateLength && (maxDate || minDate)) {
            const compareVal = minDate || maxDate;
            const compareTime = compareVal.getTime();
            const length = that.dateLength * 24 * 3600 * 1000;
            if (selectTime < compareTime - length || selectTime > compareTime + length) {
              return true;
            }
            const compareArr = [dayjs(compareVal).format(that.disableFormat), selectDate].sort();
            // 遍历一下，如果这之间有一天在屏蔽列表中，那么就屏蔽了这天
            if (
              that.disabledDateList.some(
                (ele) => Number(compareArr[0]) < Number(ele) && Number(ele) < Number(compareArr[1]),
              )
            ) {
              return true;
            }
          }
          return false;
        },
        onPick(time) {
          tmpThat.maxDate = time.maxDate;
          tmpThat.minDate = time.minDate;
        },
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              start = start >= TIMELIMIT ? start : TIMELIMIT;
              picker.$emit('pick', [start, end]);
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              start = start >= TIMELIMIT ? start : TIMELIMIT;
              picker.$emit('pick', [start, end]);
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              start = start >= TIMELIMIT ? start : TIMELIMIT;
              picker.$emit('pick', [start, end]);
            },
          },
        ],
      },
      tmpVal: [],
      dateVal: [],
    };
  },
  watch: {
    dateVal(val) {
      let res = [...(val || [])].map((item) => dayjs(item).startOf('d'));
      if (this.valueType === 'dispersed' && res.length >= 2) {
        let [start, end] = res;
        res = [];
        while (end.diff(start) >= 0) {
          res.push(start.format(this.format));
          start = start.add(1, 'd');
        }
      } else {
        res = res.map((item) => dayjs(item).format(this.format));
      }
      this.$emit('change', res);
    },
  },
};
</script>

<style>
</style>