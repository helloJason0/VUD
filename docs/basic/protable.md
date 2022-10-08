---
title: ProTable
---

#### 基础用法

::: demo
```html
<template>
  <pro-table :columns="columns" :request="request" ref="table">
    <template #operateContent="{ row }">
      <el-button type="primary" @click="detailHandle(row)">详情</el-button>
    </template>
  </pro-table>
</template>

<script>

export default {
  data() {
    return {
      columns: [
        {
          field: "batchId",
          title: "调整申请编号",
          width: "128px",
          search: true,
          columnProps: { showOverflowTooltip: true },
        },
        {
          field: "area",
          title: "地区",
          width: "80px",
          search: true,
          type: "select",
          valueEnum: {
            1: "地区一",
            2: "地区二",
          },
        },
        {
          field: "city",
          title: "城市",
          width: "64px",
          search: true,
          type: "select",
          valueEnum: {
            1: "city1",
            2: "city2",
          },
        },
        {
          field: "remark",
          title: "申请原因",
          width: "160px",
          columnProps: { "show-overflow-tooltip": true },
        },
        {
          field: "reviewStatus",
          title: "状态",
          width: "80px",
          formLabel: "业务状态",
          search: true,
          type: "select",
          options: [
            { value: "1", label: "type1" },
            { value: "2", label: "type2" },
          ],
        },
        {
          field: "operate",
          title: "操作",
          fixed: "right",
          width: "328px",
          columnSlotName: { default: "operateContent" },
        },
      ],
      request: async (params) => {
        return {list: [
          {
            id: 22619,
            batchId: "ADJUST1663246",
            area: '2',
            city: '1',
            submitter: "宋丞",
            submitter_phone: "15541974850",
            submit_time: "2022-09-15",
            amount: "130.00",
            remark: "8月3日，xxxxxxxxxxxxxx",
            reviewStatus: "1",
          },
        ]};
      },
    };
  },
  methods: {
    detailHandle(row) {
      console.log(row);
    },
  },
};
</script>
```

:::
