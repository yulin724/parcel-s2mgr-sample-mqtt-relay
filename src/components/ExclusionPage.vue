<template>
  <div>
    <div class="mui--text-center">
      <span class="dialogTitle">Remove Device</span>
    </div>
    <div>
      <strong>{{msg}}</strong>
      <p>TODO: 60 seconds count down, Z-Wave Certification Required</p>
    </div>
    <button class="pure-button button-success" @click="startExclude">Start Exclude</button>
    <button class="pure-button button-error" @click="abort">Abort</button>
  </div>
</template>
<script>
import bus from '../bus'
import api from '../api'

export default {
  name: 'ExclusionPage',
  props: [
    'uid'
  ],
  data() {
    return {
      msg: ''
    }
  },
  methods: {
    startExclude() {
      // 调用API
      api.ZW.StartExclude(this.uid, {
        success: (payload) => {
          console.log('success')
          this.msg = 'Succeed.'
        },
        failure: (payload) => {
          console.log('failure')
          this.msg = 'Failed.'
        },
        notified: (event, params) => {
          if (event === 'ZW.ModeChanged' && params.mode === 'excluding') {
            this.msg = '处于删除模式中，请触发设备 In excluding mode'
          } else if (event === 'ZW.ModeChanged' && params.mode === 'abort') {
            this.msg = '已经退出删除模式 Exclusion is aborted'
          } else if (event === 'ZW.DeviceExcluded') {
            this.msg = '删除设备, 节点号(Device is exclued, node is)' + params.addresses[0].split('/')[4]
          } else if (event === 'ZW.DeviceExcludedNotChildren') {
            this.msg = '删除了未知设备, Unknown device is removed.'
          } else {
            this.msg = event + ' ' + JSON.stringify(params)
          }
        }
      })
    },
    abort() {
      api.ZW.AbortLastOp(this.uid, {
        success: (payload) => {},
        failure: (payload) => {},
        notified: (event, params) => {}
      })
    }
  },
  mounted() {}
}
</script>
<style lang="css" scoped="">
</style>