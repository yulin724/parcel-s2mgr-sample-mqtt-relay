<template>
<div>
  <div class="mui--text-center">
    <span class="dialogTitle">Remove Failed Device</span>
  </div>
  <div>
    <strong>{{msg}}</strong>
  </div>
  node id:
  <input v-model.number="node_id"
         style="border:solid 1px;"
         type="text">
  <br/>
  <br/>
  <button class="pure-button button-success"
          @click="startRemoveFailed">Start Remove</button>
  <button class="pure-button button-error"
          @click="abort">Abort</button>
  <p>Note: 需要测试sleep/listening设备</p>
</div>

</template>

<script>
import bus from '../bus'
import api from '../api'

export default {
  name: 'RemoveFailedPage',
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
    startRemoveFailed() {
      // 调用API
      api.ZW.RemoveFailed(this.uid, this.node_id, {
        success: (payload) => {
          this.msg = 'Succeed.'
        },
        failure: (payload) => {
          console.log('failure')
          this.msg = 'Failed.'
        },
        notified: (event, params) => {
          console.log(event, params)
          if (params.code === -13) {
            this.msg = `Node ${params.node_id}, 不存在`
          }
        }
      })
    },
    // Abort 有关方法
    registerAbortNotification() {
      bus.$once('ZW.ModeChanged', payload => {
        this.msg = payload.params.mode
      })
    },
    abort() {
      api.ZW.AbortLastOp(this.uid, {
        success: (payload) => {
        },
        failure: (payload) => {
        },
        notified: (event, params) => {
        }
      })
    }
  },
  mounted() {}
}

</script>

<style lang="css" scoped="">
</style>
