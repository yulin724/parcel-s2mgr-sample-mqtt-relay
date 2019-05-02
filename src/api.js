var api = {}

api.init = function(bus) {
  api.bus = bus
}

// 通过javascript vue app内部事件方式，将需要发送的json传递到mqtt transport layer
api.sendRequest = function(json) {
  api.bus.$emit('AppSend', json)
}

api.ZW = {}

api.ZW.reqRespCallback = function(payload, reqOptions) {
  // console.log('api.ZW.reqRespCallback ', payload)
  if (payload.code === 0) {
    // 如果调用成功，那么需要注册 notifiedCallback
    if (reqOptions.success !== undefined) {
      reqOptions.success(payload)
    }
  } else {
    if (reqOptions.failure !== undefined) {
      reqOptions.failure(payload)
    }
  }
}

api.ZW.ResetNetwork = function(uid, reqOptions) {
  let registerNotifiedCallback = function(notified) {
    console.log('registerNotifiedCallback')
    console.assert(notified !== undefined, 'no notified callback parameter')
    api.bus.$on('ZW.ModeChanged', payload => {
      console.log('ZW.ModeChanged')
      notified('ZW.ModeChanged', payload.params)
    })
    // 以上是过程
    // 以下是结果
    api.bus.$on('ZW.ResetNetwork', payload => {
      unregisterNofitiedCallback()
      notified('ZW.ResetNetwork', payload.params)
    })
    // TODO: 加入对事件处理的Timeout机制
  }
  // 注册notification的回调函数
  registerNotifiedCallback(reqOptions.notified)

  let unregisterNofitiedCallback = function() {
    console.log('unregisterNofitiedCallback')
    // 关闭时间监听
    api.bus.$off('ZW.ModeChanged')
    api.bus.$off('ZW.ResetNetwork')
  }

  let req = {
    "type": "req",
    "name": "ZW.ResetNetwork"
  }
  let json = {
    topic: 's2://' + uid + '/iszh',
    payload: req,
    reqRespCallback: (payload) => {
      api.ZW.reqRespCallback(payload, reqOptions)
    }
  }
  api.sendRequest(json)
}

api.ZW.StartInclude = function(uid, reqOptions) {
  let registerNotifiedCallback = function(notified) {
    console.log('registerNotifiedCallback')
    console.assert(notified !== undefined, 'no notified callback parameter')
    api.bus.$on('ZW.ModeChanged', payload => {
      notified('ZW.ModeChanged', payload.params)
    })
    api.bus.$on('ZW.DeviceIncluded', payload => {
      unregisterNofitiedCallback()
      notified('ZW.DeviceIncluded', payload.params)
    })
    // TODO: 加入对事件处理的Timeout机制
  }
  // 注册notification的回调函数
  registerNotifiedCallback(reqOptions.notified)

  let unregisterNofitiedCallback = function() {
    console.log('unregisterNofitiedCallback')
    // 关闭时间监听
    api.bus.$off('ZW.ModeChanged')
    api.bus.$off('ZW.DeviceIncluded')
  }

  let req = {
    "type": "req",
    "name": "ZW.StartInclude"
  }
  let json = {
    topic: 's2://' + uid + '/iszh',
    payload: req,
    reqRespCallback: (payload) => {
      api.ZW.reqRespCallback(payload, reqOptions)
    }
  }
  api.sendRequest(json)
}

api.ZW.StartExclude = function(uid, reqOptions) {
  let registerNotifiedCallback = function(notified) {
    console.log('registerNotifiedCallback')
    console.assert(notified !== undefined, 'no notified callback parameter')
    api.bus.$on('ZW.ModeChanged', payload => {
      notified('ZW.ModeChanged', payload.params)
    })
    api.bus.$on('ZW.DeviceExcluded', payload => {
      unregisterNofitiedCallback()
      notified('ZW.DeviceExcluded', payload.params)
    })
    // 删除了非当前网络中的设备
    api.bus.$on('ZW.DeviceExcludedNotChildren', payload => {
      unregisterNofitiedCallback()
      notified('ZW.DeviceExcludedNotChildren', payload.params)
    })
    // TODO: 加入对事件处理的Timeout机制
  }
  // 注册notification的回调函数
  registerNotifiedCallback(reqOptions.notified)

  let unregisterNofitiedCallback = function() {
    console.log('unregisterNofitiedCallback')
    // 关闭时间监听
    api.bus.$off('ZW.ModeChanged')
    api.bus.$off('ZW.DeviceExcluded')
    api.bus.$off('ZW.DeviceExcludedNotChildren')
  }

  let req = {
    "type": "req",
    "name": "ZW.StartExclude"
  }
  let json = {
    topic: 's2://' + uid + '/iszh',
    payload: req,
    reqRespCallback: (payload) => {
      api.ZW.reqRespCallback(payload, reqOptions)
    }
  }
  api.sendRequest(json)
}

api.ZW.AbortLastOp = function(uid, reqOptions) {
  let req = {
    "type": "req",
    "name": "ZW.AbortLastOp"
  }

  api.bus.$on('ZW.ModeChanged', (payload) => {
    // Common
    api.bus.$off('ZW.ModeChanged')

    // ZW.ResetNetwork
    api.bus.$off('ZW.ResetNetwork')

    api.bus.$off('ZW.DeviceIncluded')

    api.bus.$off('ZW.DeviceExcluded')

    api.bus.$off('ZW.UpdateNetwork')

    api.bus.$off('ZW.RemoveFailed')
  })

  let json = {
    topic: 's2://' + uid + '/iszh',
    payload: req,
    reqRespCallback: (payload) => {
      api.ZW.reqRespCallback(payload, reqOptions)
    }
  }
  api.sendRequest(json)
}

api.ZW.RemoveFailed = function(uid, node_id, reqOptions) {
  let registerNotifiedCallback = function(notified) {
    console.log('registerNotifiedCallback')
    console.assert(notified !== undefined, 'no notified callback parameter')
    api.bus.$on('ZW.ModeChanged', payload => {
      notified('ZW.ModeChanged', payload.params)
    })
    api.bus.$on('ZW.RemoveFailed', payload => {
      if (payload.params.code < 0) {
        unregisterNofitiedCallback()
      }
      notified('ZW.RemoveFailed', payload.params)
    })
    api.bus.$on('ZW.DeviceExcluded', payload => {
      // 最终事件
      unregisterNofitiedCallback()
      let node_id = parseInt(payload.params.addresses[0].split('/')[4], 10)
      notified('ZW.DeviceExcluded', { node_id: node_id })
    })
    // TODO: 加入对事件处理的Timeout机制
  }
  // 注册notification的回调函数
  registerNotifiedCallback(reqOptions.notified)

  let unregisterNofitiedCallback = function() {
    console.log('unregisterNofitiedCallback')
    // 关闭时间监听
    api.bus.$off('ZW.ModeChanged')
    api.bus.$off('ZW.RemoveFailed')
    api.bus.$off('ZW.DeviceExcluded')
  }

  let req = {
    "type": "req",
    "name": "ZW.RemoveFailed",
    "params": {
      "node_id": node_id
    }
  }
  let json = {
    topic: 's2://' + uid + '/iszh',
    payload: req,
    reqRespCallback: (payload) => {
      api.ZW.reqRespCallback(payload, reqOptions)
    }
  }
  api.sendRequest(json)
}

api.ZW.ReplaceFailed = function(uid, node_id, reqRespCallback) {
  let req = {
    "type": "req",
    "name": "ZW.ReplaceFailed",
    "params": {
      "node_id": node_id
    }
  }

  let json = {
    topic: 's2://' + uid + '/iszh',
    payload: req,
    reqRespCallback: reqRespCallback
  }
  api.sendRequest(json)
}

api.ZW.UpdateNetwork = function(uid, reqOptions, reqRespCallback) {
  let registerNotifiedCallback = function(notified) {
    console.log('registerNotifiedCallback')
    console.assert(notified !== undefined, 'no notified callback parameter')
    api.bus.$on('ZW.UpdateNetwork', payload => {
      console.log(payload)
      if (payload.params.msg === 'OP_DONE') {
        unregisterNofitiedCallback()
      }
      notified('ZW.UpdateNetwork', payload.params)
    })
    // TODO: 加入对事件处理的Timeout机制
  }
  // 注册notification的回调函数
  registerNotifiedCallback(reqOptions.notified)

  let unregisterNofitiedCallback = function() {
    console.log('unregisterNofitiedCallback')
    // 关闭时间监听
    api.bus.$off('ZW.UpdateNetwork')
  }

  let req = {
    "type": "req",
    "name": "ZW.UpdateNetwork"
  }
  let json = {
    topic: 's2://' + uid + '/iszh',
    payload: req,
    reqRespCallback: (payload) => {
      api.ZW.reqRespCallback(payload, reqOptions)
    }
  }
  api.sendRequest(json)
}

export default api
