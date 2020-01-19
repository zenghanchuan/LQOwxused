// pages/login/login.js
import { Promiserequest, Common, Throttle } from '../../utils/util.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value:'',
    number:'',
    str:'',//随机验证码
    // flag:false,
    disabled :false,
    btntext:'获取验证码',
    authentication:''     //验证用户获取验证码的手机与登录注册的手机号一致
  },
  /**
   * 获取输入的手机号码
   */
  change:function(e){
    let that = this,
        value = this.data.value;
    // console.log(e.detail.value)
    that.setData({ value: e.detail.value})
  },
  /**
   * 获取用户输入的验证码
  */
  changeNum:function(e){
    let that = this,
        number = this.data.number;
    console.log(e.detail.value)
    that.setData({ number: e.detail.value })
  },
  /**
   * 点击发送按钮 向用户发送随机验证码
   */
  handel: new Throttle().throttle(function () {
    console.log('发送验证码')
    let that = this;
    let phone = that.data.value
    let disabled = this.data.disabled;
    let reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
    if (reg.test(phone)){
      wx.request({
        url: app.globalData.baseUrl + '/user/sendSms',
        method: 'GET',
        data: {
          phoneNum: phone
        },
        header: {
          "Content-Type": "application/json"
        },
        success: function (res) {
          console.log(res)
          wx.showToast({
            title: '验证码发送成功',
            icon: 'success',
            duration: 2000,
          })
          that.timer();
          that.setData({ 
            disabled: true,
            str: res.data,
            authentication: that.data.value
          })
          console.log(that.data.str, that.data.authentication)
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '网络出错啦！！！',
          })
        }
      })
    }else{
      wx.showModal({
        title: '错误',
        content: '手机号格式不正确或号码不存在',
      })
    }
  }, 2000),

  //倒计时
  timer: function () {
    let that = this;
    var coden = 60    // 定义60秒的倒计时
    var codeV = setInterval(function () {
      that.setData({    // _this这里的作用域不同了
        btntext: '重新获取' + (--coden) + 's',
        disabled: true,
      })
      if (coden == -1) {  // 清除setInterval倒计时，这里可以做很多操作，按钮变回原样等
        clearInterval(codeV)
        that.setData({
          btntext: '获取验证码',
          disabled: false
        })
      }
    }, 1000)  //  1000是1秒
  },

  signIn: new Throttle().throttle(function () { //注册登录
    var userId = this.data.value,
        number = this.data.number,
        value = this.data.value,
        str = this.data.str,
        that = this,
        authentication = this.data.authentication,
        reclick = false;
    var renum = true;
    if (userId == ''){
      wx.showModal({
        title: '提示',
        content: '请输入手机号码',
      })
    }
    else if (number == '' || str == '') {
      wx.showModal({
        title: '错误',
        content: '验证码不能为空,或者验证码错误！！！',
      })
      
    } else if (number != str){
      wx.showModal({
        title: '错误',
        content: '验证码错误！！！',
      })
      that.setData({ number:''})
    }
    else if (userId != authentication){
      wx.showModal({
        title: '提示',
        content: '验证码与手机号不匹配',
      })
      that.setData({ number: '' })
      reclick = false;
    }
    else if (renum == false){
      wx.showModal({
        title: '提示',
        content: '验证已经失效！',
      })
      return;
    }
    else if (number == str && number != '' && reclick == false) {
      reclick = false;
      console.log(app.globalData.lqoSession,)
      console.log( that.data.value, app.globalData.encryptedData)
      console.log(app.globalData.iv)
      if (app.globalData.encryptedData && app.globalData.iv){
        wx.request({
          url: app.globalData.baseUrl + '/user/addPhone',
          method: 'GET',
          data: {
            lqoSession: app.globalData.lqoSession,
            phoneNum: that.data.value,
            encryptedData: app.globalData.encryptedData,
            iv: app.globalData.iv
          },
          header: {
            "Content-Type": "application/json"
          },
          success: function (res) {
            console.log(res)
            renum = false;
            if (res.data.status == '102') {
              app.globalData.loginStatus = 0;
              console.log(that.data.value)
              wx.showToast({
                title: '手机绑定成功',
                icon: 'success'
              })
              that.setData({ number: '' })
              wx.redirectTo({
                url: '/pages/rentCar/rentCar',
              })
            } else if (res.data.status == '101') {
              app.globalData.loginStatus = 1;
              wx.showToast({
                title: '其他设备已注册',
                icon: 'none'
              })
              that.setData({ number: '' })
            } else if (res.data.status == '103') {
              wx.showModal({
                title: '提示',
                content: '数据失效，请重新注册!',
                showCancel: false,
                success(res) {
                  if (res.confirm){
                    console.log('点击确认')
                    //重新调用getOpenid
                    app.isLogin();
                    wx.redirectTo({
                      url: '/pages/rentCar/rentCar'
                    })
                  }
                }
              })
            } else {
              app.globalData.loginStatus = 1;
              wx.showToast({
                title: '手机绑定失败了',
                icon: 'none'
              })
              that.setData({ number: '' })
            }
          },
          fail: function (res) {
            wx.showModal({
              title: '提示',
              content: '网络出问题啦！！！',
            })
          }
        })
      }
      else{
        wx.showModal({
          title: '提示',
          content: '网络差,请重试',
        })
      }
    }
    else if (reclick == true){
      wx.showModal({
        title: '提示',
        content: '请勿重复点击',
      })
    }
  }, 1000),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
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