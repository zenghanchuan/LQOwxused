//app.js
App({
  globalData: {
    loginStatus: 1,
    // baseUrl: 'https://www.cjys99.com:8085',
    // baseUrl:'http://192.168.0.125:8085',
    // baseUrl: 'https://www.cjys99.com:8086',
    // baseUrl: 'http://192.168.101.36:8090',
    baseUrl: 'https://wx.laiqio.site:8090',
    // baseUrl: 'https://www.cjys99.com:8090',
    // baseUrl:'http://192.168.0.112:8090',
    haveNoData: true,
    lqoSession: '', 
    userInfo: null,
    valData: null,
    cityname: '',
    address: '',
    orderInformation: null,
    encryptedData: '',
    iv: '',
    flag:'',
    falge:'',
    userinfo:'',
  },
  onLaunch: function () {
    let that = this,
      haveNoData = this.globalData.haveNoData;
      // encryptedData = this.globalData.encryptedData,
      // iv = this.globalData.iv;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //判断登录状态
    that.isLogin();
  },
  isLogin: function (){
    let that = this;
    console.log('判断是否登录 调用getOpenid')
    wx.login({
      success: function (res) {
        console.log(res)
        if (res.code) {
          wx.request({
            url: that.globalData.baseUrl + '/user/getOpenid',
            method: 'GET',
            data: { js_code: res.code },
            header: {
              "Content-Type": "application/json"
            },
            success: function (res) {
              console.log(res)
              that.globalData.userinfo = res;
              console.log('ok');
              that.globalData.haveNoData = false
              that.globalData.lqoSession = res.data.lqoSession;
              if (res.data.status == '101') {
                that.globalData.loginStatus = 1;
              } else if (res.data.status == '102') {
                that.globalData.loginStatus = 0;
                //判断是否存在UnionId
                console.log(res.data.unionId)
                if (res.data.unionId == null || res.data.unionId == '') {
                  console.log(res.data.lqoSession)
                  console.log(that.globalData.encryptedData)
                  console.log(that.globalData.iv)
                  if (that.globalData.encryptedData && that.globalData.iv) {
                    console.log('已获取')
                    wx.request({
                      url: that.globalData.baseUrl + '/user/updateUnionId',
                      method: 'GET',
                      data: {
                        lqoSession: res.data.lqoSession,
                        encryptedData: (that.globalData.encryptedData),
                        iv: that.globalData.iv
                      },
                      header: {
                        "Content-Type": "application/json"
                      },
                      success: function (res) {
                        console.log(res)
                        if (res.data.status == '102') {
                          that.globalData.flag = false;//无需再调用uid获取更新
                        } else {
                          that.globalData.flag = true;//需重新调用uid相关接口
                        }
                      },
                      fail: function (res) {
                        that.globalData.flag = true;//需重新调用uid相关接口
                      }
                    })
                  } else {
                    wx.showLoading({
                      title: '正在获取',
                    })
                    that.globalData.flag = true;//需重新调用uid相关接口
                  }
                }
                else {
                  that.globalData.flag = false;
                }
              }
            }
          })
        }
        else {
          console.log('登录失败！' + res.errMsg)
        }
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '错误',
          content: '网络错误',
        })
      },
      complete: function (res) { },
    })
  }
})