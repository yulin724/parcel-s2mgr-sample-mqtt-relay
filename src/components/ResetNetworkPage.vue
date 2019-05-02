<template>
<div>
  <div class="mui--text-center">
    <span class="dialogTitle">Reset Network</span>
  </div>
  <div>
    <strong>{{msg}}</strong>
  </div>
  <button class="pure-button button-error"
          @click="gogo">Reset</button>
</div>

</template>

<script>
import bus from '../bus'
import api from '../api'

export default {
  name: 'ResetNetworkPage',
  props: [
    'uid'
  ],
  data() {
    return {
      msg: ''
    }
  },
  methods: {
    notified(event, params) {
      console.log('ZW.ResetNetwork notified event=' + event)
      if (event === 'ZW.ModeChanged' && params.mode === 'resetting') {
        this.msg = 'Resetting...'
      } else if (event === 'ZW.ModeChanged' && params.mode === 'resetted') {
        this.msg = 'Resetted.'
      } else if (event === 'ZW.ResetNetwork' && params.code === 0) {
        this.msg = 'Resetted.'
      } else if (event === 'ZW.ResetNetwork' && params.code === 255) {
        this.msg = 'Operation failed.'
      }
    },
    gogo() {
      // 调用API
      api.ZW.ResetNetwork(this.uid, {
        success: (payload) => {
          this.msg = 'Succeed.'
        },
        failure: (payload) => {
          console.log('failure')
          this.msg = 'Failed.'
        },
        notified: (event, params) => {
          this.notified(event, params)
        }
      })
    }
  },
  mounted() {}
}

</script>

<style lang="css" scoped="">
</style>
