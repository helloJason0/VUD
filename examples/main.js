import Vue from 'vue'
import App from './App.vue'
import router from './router'
import element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
Vue.use(element)
Vue.axios = axios
import vudui from '../packages/index'
// 按需加载的全部
// import '../lib/css/index.css'
// import vudui from '../lib/index' 
// import vudui from 'vudui'
// import  "vudui/lib/css/index.css"; //整体输出的
Vue.use(vudui)
// import {
//   MultiSelect,
//   MultiOption,
//   FormTable,
//   FormDialog
// } from 'vudui'
// Vue.component('MultiSelect', MultiSelect);
// Vue.component('MultiOption', MultiOption);
// Vue.component('FormTable', FormTable);
// Vue.component('FormDialog', FormDialog);

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
