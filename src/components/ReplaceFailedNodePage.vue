<template>
<div>
  <div class="mui--text-center">
    <span class="dialogTitle">Replace failed device with new one</span>
  </div>
  <div>
    <strong>{{msg}}</strong>
    <p>TODO: 60秒倒计时认证需要</p>
  </div>
  node id:
  <input v-model.number="node_id"
         type="text">
  <br/>
  <br/>
  <button class="pure-button button-success"
          @click="startReplaceFailed">Start Replace</button>
  <button class="pure-button button-error"
          @click="abort">Abort</button>
</div>

</template>

<script>
import bus from '../bus'
import api from '../api'

export default {
  name: 'ReplaceFailedNodePage',
  props: [
    'uid'
  ],
  data() {
    return {
      msg: '',
      node_id: null
    }
  },
  methods: {
    registerReplaceFailedNotification() {
      bus.$on('ZW.ModeChanged', payload => {
        this.msg = payload.params.mode
      })
      bus.$on('ZW.ReplaceFailed', payload => {
        if (payload.params.code === 0) {
          this.msg = 'Replace failed node ' + payload.params.node_id
        } else {
          this.msg = 'Failed, error: ' + payload.params.msg
        }
      })

      bus.$once('ZW.DeviceIncluded', payload => {
        this.msg = 'Add node ' + payload.params.nodeid
        bus.$off('ZW.ModeChanged')
      })
    // TODO: 加入对事件处理的Timeout机制
    },
    startReplaceFailed() {
      // 调用API
      api.ZW.ReplaceFailed(this.uid, this.node_id, (payload) => {
        if (payload.code === 0) {
          // 调用成功
          this.msg = 'ZW.ReplaceFailed call succeed.'
          // 调用成功的情况下, 注册异步事件的处理
          this.registerReplaceFailedNotification()
        } else {
          this.msg = 'ZW.ReplaceFailed call failed, error:' + payload.msg
        }
      })
    },
    registerAbortNotification() {
      bus.$once('ZW.ModeChanged', payload => {
        this.msg = payload.params.mode
      })
    },
    abort() {
      // 关闭之前的事件订阅
      bus.$off('ZW.ModeChanged')
      bus.$off('ZW.DeviceIncluded')

      api.ZW.AbortLastOp(this.uid, (payload) => {
        if (payload.code === 0) {
          // 调用成功
          this.msg = 'ZW.AbortLastOp call succeed.'
          this.registerAbortNotification()
        } else {
          this.msg = 'ZW.AbortLastOp call failed, error:' + payload.msg
        }
      })
    }
  },
  mounted() {}
}

</script>

<style lang="css" scoped="">
</style>
