// pages/rideEnd/rideEnd.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: [],
    repairPrice: null,
    repairType: null,
    time: '',
    timeState: true,
    tips: '确认支付',
    totalPrice: 0,
  },

  complete: function () { //time开始判断 是否为15分钟以内
    let that = this;
    let totalPrice = that.data.order.totalPrice,
      prepayment = that.data.order.prepayment,
      repairPrice = that.data.repairPrice,
      repairType = that.data.repairType,
      time = '';

    console.log(that.data.time,app.globalData.address);
    //订单创建超过1分钟
    if (app.globalData.address == '三亚市'){
      console.log('三亚市')
      time = that.data.time - 20 * 60;
    }else{
      console.log('其他城市')
      time = that.data.time - 15 * 60;
    }
    console.log(time)

    wx.showLoading({
      title: '加载中。。。',
    })

    if (time > 0){
      console.log('超过15分钟');
      console.log(totalPrice);
      if(totalPrice < prepayment){
        console.log("退款");
        that.refund(totalPrice);
      } else if (totalPrice > prepayment){
        console.log("补钱");
        that.returnParam('1');
      }
      else{
        console.log("结束订单");
        //结束订单
        that.endOrder();
      }
    }
    else{
      console.log('未超过15分钟');
      if (totalPrice < prepayment){
        //退款
        that.refund('0');
      } else if(totalPrice > prepayment){
        //补钱
        that.returnParam(0);
      } else {
        console.log("结束订单");
        //结束订单
        that.endOrder();
      }
    }
  },

  //退款
  refund: function(e){
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/order/refund',
      data: {
        price: e,
        lqoSession: app.globalData.lqoSession,
        sign: '1',
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102') {
          //结束订单
          that.endOrder();
        }
        else if (res.data.status === 101) {
          wx.hideLoading();
          wx.showToast({
            title: '退款失败！',
            icon: 'none'
          })
        }
      }
    })
  },

  //补钱
  returnParam:function(e){
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/order/returnParam',
      data: {
        lqoSession: app.globalData.lqoSession,
        num: e,
        image: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
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
              console.log('支付成功！');
              //结束订单
              that.endOrder();
            } else {
              console.log('支付失败')
              wx.showToast({
                title: '支付失败！请重试！',
                icon: 'none'
              })
            }
          },
        })
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  //结束订单
  endOrder: function (){
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/order/over',
      data: {
        lqoSession: app.globalData.lqoSession,
        // orderNo: that.data.order.orderNo,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102') {
          wx.hideLoading();
          wx.showToast({
            title: '订单已结束！',
          })
          setTimeout(function () {
            // wx.redirectTo({
            //   url: '/pages/rentCar/rentCar',
            // })
            wx.reLaunch({
              url: '/pages/rentCar/rentCar',
            })
          }, 1000)
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log(options)
    that.setData({
      order: JSON.parse(options.order),
      repairPrice: options.repairPrice,
      repairType: options.repairType,
      time: options.time,
    })
    console.log(that.data);

    let totalPrice = that.data.order.totalPrice,
      diffAreaPrice = that.data.order.diffAreaPrice == null ? 0 : that.data.order.diffAreaPrice,
      repairPrice = parseInt(that.data.repairPrice == 'null' ? 0 : that.data.repairPrice),
      orderPrice = that.data.order.orderPrice,
      prepayment = that.data.order.prepayment,
      time = '';
    if (app.globalData.address == '三亚市'){
      console.log('三亚市')
      time = that.data.time - 20 * 60;
    }else{
      console.log('其他城市')
      time = that.data.time - 15 * 60;
    }

    console.log(diffAreaPrice, repairPrice);  
    if (totalPrice > prepayment){
      that.setData({
        tips: '确认支付',
      })
    }else{
      that.setData({
        tips: '完成'
      })
    }
    console.log(time)
    console.log(app.globalData.address)
    if(time > 0){
      that.setData({
        timeState: false,
        totalPrice: totalPrice
      })
    }else{
      that.setData({
        timeState: true,
        totalPrice: diffAreaPrice + repairPrice
      })
    }

    console.log(that.data.order.diffAreaPrice != null)
    console.log(that.data.order.diffAreaPrice == null)
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