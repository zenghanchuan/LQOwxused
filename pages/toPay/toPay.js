// pages/toPay/toPay.js
import myButton from "../../conponents/currency/myButton/index"
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  method:{
    topay:function() {
      console.log(app.globalData)
      wx.request({
        url: app.globalData.baseUrl + '/order/returnParam',
        data: {
          lqoSession: app.globalData.lqoSession,
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: (res) => {
          console.log(res)
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success: (res) => {
              console.log(res)
              if (res.errMsg == 'requestPayment:ok') {
                console.log('支付成功！')
              }
              else {
                console.log('支付失败')
              }
            },
          })
        },
      })
    },
  },
  
  data: {
    residualPrice:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let residualPrice = options.orderPrice - options.prepayment //减去已支付
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