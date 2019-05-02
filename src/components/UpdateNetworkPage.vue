<template>
<div>
  <div class="mui--text-center">
    <span class="dialogTitle">Update Network</span>
  </div>
  <strong>This action will take long time.</strong>
  <div>
    <strong>{{msg}}</strong>
  </div>
  <button class="pure-button button-success"
          @click="startUpdateNetwork">Update</button>
</div>

</template>

<script>
import bus from '../bus'
import api from '../api'

export default {
  name: 'UpdateNetworkPage',
  props: [
    'uid'
  ],
  data() {
    return {
      msg: ''
    }
  },
  methods: {
    startUpdateNetwork() {
      bus.$off('ZW.UpdateNetwork')

      // 调用API
      api.ZW.UpdateNetwork(this.uid, {
        success: (payload) => {
          console.log('success')
          this.msg = 'Succeed.'
        },
        failure: (payload) => {
          console.log('failure')
          this.msg = 'Failed.'
        },
        notified: (event, params) => {
          if (event === 'ZW.UpdateNetwork') {
            if (params.msg === 'OP_NU_TOPOLOGY') {
              this.msg = '正在更新网络结构'
            } else if (params.msg === 'OP_NU_NEIGHBOR') {
              this.msg = '正在更新邻居节点 ' + params.completed + '/' + params.total
            } else if (params.msg === 'OP_NU_GET_NODE_INFO') {
              this.msg = '正在获取节点信息'
            } else if (params.msg === 'OP_DONE') {
              this.msg = '完成网络更新'
            } else {
              this.msg = params.msg
            }
          }
        }
      })
    }
  },
  mounted() {}
}

</script>

<style lang="css" scoped="">
</style>
