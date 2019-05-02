<template>
  <div style="padding:15px;">
    <div v-if="!mqtt.connected" class="pure-form">
      <fieldset>
        <legend>Gateway UID:</legend>
        <input type="text" style="width:100%;" v-model="gw.uid" placeholder="uid">
        <legend>MQTT Relay Server Host</legend>
        <input type="text" style="width:100%;" v-model="mqtt.host">
        <legend>MQTT Relay Server Port</legend>
        <input type="text" style="width:100%;" v-model="mqtt.port">
        <button @click="mqttConnect" class="pure-button button-success">{{mqtt.connected?'Connected':'Connect'}}</button>
      </fieldset>
      <hr />
    </div>
    <!--  -->
    <!--  -->
    <!-- Function UI -->
    <div style="padding:5px;">
      <button class="pure-button button-error" @click="openDialog('ResetDialog')">Reset</button>
    </div>
    <div style="padding:5px;">
      <button class="pure-button button-warning" @click="openDialog('ClassicInclusionDialog')">Abort</button>
    </div>
    <div style="padding:5px;">
      <button class="pure-button button-secondary" @click="openDialog('ClassicInclusionDialog')">Classic Include</button>
    </div>
    <div style="padding:5px;">
      <button class="pure-button button-secondary" @click="openDialog('ExclusionDialog')">Exclude</button>
    </div>
    <modal name="ResetDialog">
      <div class="dialogLayout">
        <ResetNetworkPage :uid="this.gw.uid" />
      </div>
    </modal>
    <modal name="ClassicInclusionDialog">
      <div class="dialogLayout">
        <ClassicInclusionPage :uid="this.gw.uid" />
      </div>
    </modal>
    <modal name="ExclusionDialog">
      <div class="dialogLayout">
        <ExclusionPage :uid="this.gw.uid" />
      </div>
    </modal>
    <modal name="RemoveFailedNodeDialog">
      <div class="dialogLayout">
        <RemoveFailedNodePage :uid="this.gw.uid" />
      </div>
    </modal>
    <modal name="ReplaceFailedNodeDialog">
      <div class="dialogLayout">
        <ReplaceFailedNodePage :uid="this.gw.uid" />
      </div>
    </modal>
    <modal name="UpdateNetworkDialog">
      <div class="dialogLayout">
        <UpdateNetworkPage :uid="this.gw.uid" />
      </div>
    </modal>
  </div>
</template>
<script>
import mqtt from 'mqtt'
import ResetNetworkPage from './ResetNetworkPage'
import ClassicInclusionPage from './ClassicInclusionPage'
import ExclusionPage from './ExclusionPage'
import RemoveFailedNodePage from './RemoveFailedNodePage'
import ReplaceFailedNodePage from './ReplaceFailedNodePage'
import UpdateNetworkPage from './UpdateNetworkPage'

import bus from '../bus'

import api from '../api'
api.init(bus)

var app = {
  debug: console.debug,
  log: console.log
}

let APP_BUNDLE_NAME = 'cn.innosmart.heimdallr.ios'
let CLIENT_ID = 's2mgrSample-' + (new Date().getTime())

export default {
  name: 'HomePage',
  components: {
    ResetNetworkPage,
    ClassicInclusionPage,
    ExclusionPage,
    RemoveFailedNodePage,
    ReplaceFailedNodePage,
    UpdateNetworkPage
  },
  data() {
    let uid = localStorage.getItem('uid') || 'ECESAX5CYXGHBDWV111A'
    let rpcRequestTopic = `/relay/${uid}/gw/call`
    let rpcResponseTopic = `/relay/${uid}/app/${APP_BUNDLE_NAME}/${CLIENT_ID}/resp`
    let asyncNotificationTopic = `/relay/${uid}/brain://out`

    return {
      app: {
        debug: true
      },
      gw: {
        uid: uid
      },
      rpcRequestTopic: rpcRequestTopic,
      rpcResponseTopic: rpcResponseTopic,
      asyncNotificationTopic: asyncNotificationTopic,
      mqtt: {
        host: localStorage.getItem('ip') || '47.100.127.150',
        port: 19001,
        client: null,
        connected: false,
        options: {
          clientId: 's2mgr_sample_app' + new Date().getTime(),
          keepalive: 60 * 60,
          resubscribe: true, // resubscribe after reconnect
          reconnectPeriod: 1000, // reconnect period
          username: 'gw',
          password: 'test'
        },
        reqTimer: {}
      }
    }
  },
  methods: {
    mqttConnect() {
      let mqttURL = 'ws://' + this.mqtt.host + ':' + this.mqtt.port + '/mqtt'

      app.log('1. MQTT Connect to', mqttURL)

      localStorage.setItem('uid', this.gw.uid)
      localStorage.setItem('ip', this.mqtt.host)

      this.mqtt.options.username = 'app' + this.gw.uid
      this.mqtt.options.password = Buffer.from('app' + this.gw.uid)

      this.mqtt.client = mqtt.connect(mqttURL, this.mqtt.options)
      this.mqttCallbackInit()
    },
    // MQTT CallbackInit
    mqttCallbackInit() {
      this.mqtt.client.on('connect', () => {
        app.log(' mqtt connect ok')
        this.mqtt.connected = true
        // To do some subscribe
        app.log('2. MQTT Subscribe')
        this.mqtt.client.subscribe(this.rpcResponseTopic)
        app.log(' Subscribe rpcResponseTopic:', this.rpcResponseTopic)

        this.mqtt.client.subscribe(this.asyncNotificationTopic)
        app.log(' Subscribe asyncNotificationTopic:', this.asyncNotificationTopic)
      })
      this.mqtt.client.on('close', () => {
        app.log(' mqtt connect close')
        this.mqtt.connected = false
      })
      this.mqtt.client.on('message', (topic, message) => {
        console.log('收到', message.toString())
        let json = JSON.parse(message.toString())
        console.log('json', json)
        this.injectMessageIntoApp(json)
      })
    },
    // inject mqtt incoming message into app
    injectMessageIntoApp(json) {
      // 由 MQTTClient on message 回调函数进行调用，见 mqttCallbackInit on message
      if (json.type === 'resp') {
        app.log(json.type, json)
        let callid = json.callid
        let event = 'callid_' + callid
        let timerName = 'callid_' + callid + '_timer'
        // 清理 timeout 定时器, clear timeout timer
        clearTimeout(this.mqtt.reqTimer[timerName])
        // 发送事件, send event
        bus.$emit(event, json)
      } else if (json.type === 'notif') {
        // app.log(json.type, json.name, json.params)
        bus.$emit(json.name, json)
      } else {
        app.log('unknown payload, not process it.')
      }
    },
    // 为 Request 注册 Response Callback, register response callback for request
    registerResponseCallback(callid, reqRespCallback) {
      let event = 'callid_' + callid
      bus.$once(event, payload => {
        reqRespCallback(payload)
      })
      this.mqtt.reqTimer[event + '_timer'] = setTimeout(() => {
        bus.$off(event)
        clearTimeout(this.mqtt.reqTimer[event + '_timer'])
      }, 5000)
    },
    AppSend(json) { // wrap mqtt publish
      // 使用MQTTClient进行消息的发送, use MQTTClient to send messgage
      let topic = this.rpcRequestTopic
      let payload = json.payload

      payload.callid = Math.floor(new Date().getTime() / 1000) // javascript的timestamp精度13位
      payload.source = `app/${APP_BUNDLE_NAME}/${CLIENT_ID}/resp`

      payload.jwt = 'Bearer abc'

      // Replace
      console.log(topic, JSON.stringify(payload))
      this.mqtt.client.publish(topic, JSON.stringify(payload), (error) => {
        if (error === undefined) {
          if (json.reqRespCallback !== undefined) {
            this.registerResponseCallback(payload.callid, json.reqRespCallback)
          }
        } else {
          alert('MQTT Error')
        }
      })
    },
    openDialog(dialogName) {
      this.$modal.show(dialogName)
      bus.$emit('test', 'hello')
    },
    closeDialog() {
      this.$modal.hide(dialogName)
    }
  },
  mounted() {
    // 定义一个bus event用于接收来自子组件的 信息发送请求
    // define a bus event to recieve "AppSend" event from child component
    bus.$on('AppSend', (json) => {
      console.log('AppSend event handler')
      this.AppSend(json)
    })
  }
}
</script>
<style scoped="">
.dialogLayout {
  padding: 15px;
}
</style>