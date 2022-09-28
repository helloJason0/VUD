<template>
  <div class="container">
    <el-row :gutter="24" style="margin: 0">
      <el-form
        :model="tempFormData"
        ref="formRef"
        v-bind="formConfig"
        label-position="left"
      >
        <el-col
          v-for="{
            type,
            field,
            formSlotName,
            formProps,
            formEmits,
            options,
            formName,
            formLabel,
            span,
          } in formColumns"
          :span="span || 8"
          :key="field"
        >
          <el-form-item
            :label="formLabel"
            :prop="formName || field"
            class="form-item"
          >
            <slot
              v-if="formSlotName"
              class="item-content"
              :modelVal="tempFormData[formName || field]"
            />
            <!-- <slot :name="" > -->
            <template v-else>
              <date-picker
                v-if="type === 'dateRange'"
                :placeholder="`请选择${formLabel}`"
                v-model="tempFormData[field]"
                v-bind="formProps"
                v-on="formEmits"
                class="item-content"
                size="small"
              />
              <el-select
                v-else-if="type === 'select'"
                :placeholder="`请选择${formLabel}`"
                v-model="tempFormData[field]"
                v-bind="formProps"
                v-on="formEmits"
                class="item-content"
                size="small"
              >
                <el-option
                  v-for="{ value, label } in options"
                  :label="label"
                  :value="value"
                  v-bind="options"
                  :key="value"
                />
              </el-select>
              <el-input
                v-else
                v-model="tempFormData[field]"
                :placeholder="`请输入${formLabel}`"
                class="item-content"
                v-bind="formProps"
                v-on="formEmits"
                size="small"
              />
            </template>
            <!-- </slot> -->
          </el-form-item>
        </el-col>
      </el-form>
      <div class="operate-bar">
        <el-button
          :loading="loading"
          type="primary"
          size="small"
          class="operate-item"
          @click="selectSubmit"
        >
          查询
        </el-button>
        <slot
          name="formOperate"
          :formData="formData"
          :uploadTable="uploadTable"
        />
      </div>
    </el-row>
    <el-table
      v-loading="loading"
      :data="tableData"
      class="table"
      border
      :row-key="rowKey"
      v-bind="$attrs"
    >
      <template
        v-for="{
          title,
          field,
          width,
          columnProps,
          columnSlotName,
          hideInTable,
          fixed,
          formatter,
          valueEnum,
        } in columnsOpt"
      >
        <el-table-column
          v-if="!hideInTable"
          :key="field"
          :prop="field"
          :label="title"
          :width="width"
          :fixed="fixed"
          :formatter="
            formatter ||
            (valueEnum && ((row, _t, val) => formatterHandle(val, valueEnum)))
          "
          v-bind="columnProps"
        >
          <template
            v-for="(slotVal, slotKey) in columnSlotName || {}"
            #[slotKey]="scope"
          >
            <slot :name="slotVal" v-bind="scope" />
          </template>
        </el-table-column>
      </template>
    </el-table>
    <el-pagination
      style="float: right; margin-right: 16px"
      background
      :current-page="current"
      :page-size="pageSizeData || pageSize"
      :pager-count="7"
      layout="prev, pager, next, sizes"
      :total="total"
      :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
      @current-change="pageChange"
      @size-change="sizeChange"
    >
    </el-pagination>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../@types" />

import DatePicker from '../../DatePicker';
import Vue, { PropType } from 'vue';
import type { Params, ProTableData, ProTableProps, RequestRes } from './type';
import { valueEnumHandle, optionsHandle } from 'free-utils';

export default Vue.extend({
  components: { DatePicker },
  props: {
    request: {
      type: Function as PropType<(params: Params) => Promise<RequestRes>>,
      default: () => () => new Promise<RequestRes>((resolve) => {
        resolve({} as RequestRes)
      })
    },
    columns: {
      type: Array as PropType<ProTableProps['columns']>,
      default: () => []
    },
    rowKey: {
      type: String as PropType<string>,
      default: 'id'
    },
    /** 页面大小 */
    pageSize: {
      type: Number as PropType<number>,
      default: 50
    },
    /** 当前页的名称 */
    currentField: {
      type: String as PropType<string>,
      default: 'page_no'
    },
    pageSizeField: {
      type: String as PropType<string>,
      default: 'page_size'
    },
    formConfig: {
      type: Object,
      default: () => ({})
    }
  },
  name: 'ProTable',
  computed: {
    formColumns () {
      return [
        ...this.columns
          .filter(({ search }) => search)
          .map(({ title, valueEnum, options, formLabel, ...reset }) => {
            return {
              title,
              options: options ?? valueEnumHandle(valueEnum || []),
              formLabel: formLabel || title,
              valueEnum,
              ...reset
            };
          })
      ];
    },
    columnsOpt () {
      return this.columns.map(({ options, valueEnum, ...resets }) => {
        const optionsSource = options || valueEnum
        return {
          valueEnum: optionsSource ? optionsHandle(optionsSource) : undefined,
          options,
          ...resets
        }
      })
    }
  },
  data () {
    const createData = (): ProTableData['formData'] =>
      this.columns
        .filter(({ search }) => search)
        .reduce((pre, cur) => {
          return Object.assign(pre, { [cur.formName || cur.field]: cur.initValue });
        }, {});
    return {
      formData: createData(),
      tempFormData: createData(),
      tableData: [] as ProTableData['tableData'],
      total: 0,
      current: 1,
      loading: false,
      pageSizeData: 0
    };
  },
  methods: {
    formatterHandle (val: string, valueEnum: Map<string | number, string | number>) {
      const res = valueEnum.get(val)
      return res !== undefined ? res : '--'
    },
    async getTableData () {
      this.loading = true;
      try {
        const { currentField, pageSizeField, current, pageSize, formData } = this;
        const { list, ...resetData } = await this.request({
          ...formData,
          [currentField]: current,
          [pageSizeField]: pageSize
        });
        const tableData = list || resetData.tableData;
        Object.assign(this, { ...resetData, tableData });
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    selectSubmit () {
      Object.assign(this.formData, this.tempFormData);
      this.getTableData();
    },
    uploadTable () {
      this.getTableData();
    },
    refreshTableData () {
      this.current = 1;
      this.getTableData();
    },
    sizeChange (num: number) {
      this.pageSizeData = num;
      this.getTableData();
    },
    pageChange (current: number) {
      this.current = current;
      this.getTableData();
    }
  },
  mounted () {
    this.getTableData();
  }
})
</script>

<style lang="less" scoped>
.form-item {
  display: flex;
}
/deep/.el-form-item__content {
  flex: 1;
}
.item-content {
  width: 100%;
}
.container {
  background: #fff;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}
.operate-bar {
  float: right;
  padding-bottom: 4px;
  line-height: 38px;
}
</style>
