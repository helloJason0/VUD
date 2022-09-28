<template>
  <div >
    <div class="example-area">
      <demo-base />
    </div>
  </div>
</template>

<script lang="ts">
import DemoBase from './demoBase.vue';
// import 

export default {
  components: { DemoBase },
  render: (h) => {
    return h('div', {
      slot: 'hello'
    })
  },
  data() {
    return {
     
    };
  },
  methods: {
   
  },
};
</script>