// pages/explain/explain.js
var qqmap = require('../../libs/qqmap-wx-jssdk.js');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scenicSpot: '',//用户当前位置
    nearSpot:'',
    latitude: '',
    longitude: '',
    loactionString: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    show:false,
    userService: false,
    rental: false,
    dataReady: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this,
      scenicSpot = this.data.scenicSpot,
      nearSpot = this.data.nearSpot,
      longitude = this.data.longitude,
      latitude = this.data.latitude;
    // 实例化API核心类
    var demo = new qqmap({
      key: 'YTGBZ-EDBKG-RZZQN-IY4IU-XREHS-PWFRX'
    });
    wx.getLocation({
      type: 'gcj02',  //编码方式，
      success: function (res) {
        var latitude = res.latitude   // wx.getLocation 获取当前的地理位置、速度   latitude(维度)  longitude（经度）
        var longitude = res.longitude
        demo.reverseGeocoder({
          //腾讯地图api 逆解析方法 首先设计经纬度
          location: {
            latitude: res.latitude,
            longitude: res.longitude
            // latitude: 24.824143, //  测试怪异地址市级地址
            // longitude: 110.50692,
          },
          //逆解析成功回调函数
          success: function (res) {
            console.log(res)
            console.log(res.result.ad_info.city,res.result.address)
            getApp().globalData.cityname = res.result.address;   //全局变量存放城市   res.result.address_component.city 获取解析之后地址中的城市 33
            getApp().globalData.address = res.result.ad_info.city;
            that.setData({ scenicSpot: res.result.address,
              nearSpot: res.result.ad_info.name
            })
            
          },
          fail: function (res) {
            //失败的回调函数
            console.log(res);
          },
          complete: function (res) {
            //完成之后的回调函数，不管是否成功
            console.log("逆解析状态码：" + res.status);  //res.status  获取状态码，为0代表解析成功，但是我们要考虑失败的兼容，可能用户并不愿意同意获取地理位置，所以不为0 的时候也要加载内容给个默认地址
            
            console.log("定位获取的：" + getApp().globalData.cityname);
          }
        });
      }
    });
    console.log(app.globalData.haveNoData)
    if (app.globalData.haveNoData == true){
       wx.showLoading({            //避免服务器未连接时用户点击
          title: '加载中',
          mask: 'true',
        })
      setTimeout(function () {
        if (app.globalData.haveNoData == false){
          wx.hideLoading()
        }
      }, 5000)
    }else{
      wx.hideLoading()
    }

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo)
              console.log('用户已经授权过')
              app.globalData.userInfo = res.userInfo;
              app.globalData.encryptedData = res.encryptedData;
              app.globalData.iv = res.iv;
              app.globalData.falge = true;
            }
          })
        } else{
          console.log('用户未授权')
          app.globalData.falge = false
        }
      }
    })
  },

  // 协议子组件传值
  myeventUser: function (e){
    let that = this;
    that.setData({
      userService: e.detail.userService
    })
    that.loginBtn();
  },
  myeventRental: function (e) {
    let that = this;
    that.setData({
      rental: e.detail.rental
    })
    that.loginBtn();
  },

  // 传值给 loginButton 按钮
  loginBtn: function () {
    let that = this;
    if (that.data.userService && that.data.rental){
      that.setData({
        dataReady: false,
      })
    }else {
      that.setData({
        dataReady: true,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // wx.setNavigationBarTitle({
    //   title: '扫码租车'
    // })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})