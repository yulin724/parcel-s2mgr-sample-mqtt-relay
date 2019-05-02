<template>
  <div id="app">
    <HomePage />
  </div>
</template>
<script>
import Vue from 'vue'
import VModal from 'vue-js-modal'
Vue.use(VModal)

// import Mui from 'vue-awesome-mui'
// import 'vue-awesome-mui/mui/dist/css/mui.css'
// mount with global
// Vue.use(Mui)

import HomePage from './components/HomePage'

export default {
  name: 'app',
  components: {
    HomePage
  }
}
</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>