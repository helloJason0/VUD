<template>
  <div >
    <div class="example-area">
      <demo-base />
      <collapse-panel :markdownContent="baseCode"></collapse-panel>
    </div>
  </div>
</template>

<script lang="ts">
import DemoBase from './demoBase.vue';
import CollapsePanel from '../../components/CollapsePanel.vue'

const baseCode = require("./demoBase.vue")

export default {
  components: { DemoBase, CollapsePanel },
  render: (h) => {
    return h('div', {
      slot: 'hello'
    })
  },
  data() {
    return {
     baseCode: JSON.stringify(baseCode)
    };
  },
  methods: {
   
  },
};
</script>