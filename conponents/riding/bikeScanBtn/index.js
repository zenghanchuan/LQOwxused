// conponents/riding/bikeFunctionBtn/index.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    bikeScan: "继续用车"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    scanCode: function() {
      console.log("继续用车")
      wx.showLoading({
        title: '加载中。。。',
      })
      wx.request({
        url: app.globalData.baseUrl + '/bike/unlock',
        method: 'post',
        data: {
          cId: wx.getStorageSync("cid"),
          lqoSession: app.globalData.lqoSession,
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.hideLoading();
          console.log(res);
          if (res.data.status == '100'){
            wx.showModal({
              title: '提示',
              content: '参数传入错误！请重新点击！',
              showCancel: false,
            })
          } else if (res.data.status == '101'){
            wx.showModal({
              title: '提示',
              content: '请稍后再试！',
              showCancel: false,
            })
          } else if (res.data.status == '103'){
            wx.showModal({
              title: '提示',
              content: '当前用户无订单',
              showCancel: false,
              success: function(res) {
                if (res.confirm){
                  wx.navigateTo({
                    url: '/pages/riding/riding',
                  })
                }
              }
            })
          } else {
            let arry = JSON.parse(res.data.result);
            console.log(arry.code)
            if (arry.code == "success") {
              wx.showToast({
                title: '开锁成功',
              })
            } else if (arry.code == "unknown_identity") {
              wx.showToast({
                title: '请求的锁不存在',
                icon: 'none',
              })
            } else if (arry.code == "timeout") {
              wx.showToast({
                title: '等待锁响应超时',
                icon: 'none',
              })
            } else if (arry.code == "inner_error") {
              wx.showToast({
                title: '内部错误',
                icon: 'none',
              })
            } else if (arry.code == "wrong_para") {
              wx.showToast({
                title: '参数错误',
                icon: 'none',
              })
            } else if (arry.code == "cmd_send_fail") {
              wx.showToast({
                title: '向锁发送指令失败',
                icon: 'none',
              })
            } else if (arry.unlock_way == "Fail-Unlocked") {
              wx.showModal({
                title: '提示',
                content: '锁没关闭,查看是否卡住了',
                showCancel: false,
              })
            } else {
              wx.showToast({
                title: '开锁失败',
                icon: 'none',
              })
            }
          }
        }
      })
    }
  }
})