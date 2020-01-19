// pages/admin/admin.js
import { Throttle } from '../../utils/util.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sign: '',
    orderId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  //车辆管理
  carManage: new Throttle().throttle(function () {
    wx.navigateTo({
      url: '/pages/vehicleAndManage/vehicleAndManage',
    })
  }, 1000),

  // 扫码
  scan: new Throttle().throttle(function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.scanCode({
      success: (res) => {
        console.log(res)
        
        if (res.result.length === 37) {
          console.log(123)
          //助力车扫码
          that.setData({
            code: res.result,
            sign: '1',
          })
          console.log(that.data.code);
          that.findOrder(res.result.slice(19))
        }
        //电动车扫码
        else if (res.result.length == 41){
          console.log(res);
          that.setData({
            code: res.result.slice(24),
            sign: '2'
          })
          if (res.result.slice(24, 28) == 'code'){
            that.infoDdc(that.data.code);
          }
        }
        //旧电动车扫码
        else if (res.result.length == 17){
          that.setData({
            code: res.result,
            sign: '2'
          })
          if (res.result.slice(0, 4) == 'code'){
            that.infoDdc(that.data.code);
          }
        }
        else {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '无效二维码。。。',
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        // common.showModal('扫描二维码', "扫描失败，请重试", false);
        wx.showModal({
          title: '提示',
          content: '扫描失败，请重新扫描！！！',
        })
      }
    })
  }, 2000),
  
  //查询车辆订单 赋值给app.globalData.orderInformation
  findOrder: function(e){
    let that = this;
    wx.request({//查询该车辆是否有订单
      url: app.globalData.baseUrl + '/order/getOrderByBike',
      method: 'post',
      data: {
        code: e,
        lqoSession: app.globalData.lqoSession,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        app.globalData.orderInformation = res.data;
        //存放管理员得到的cid
        wx.setStorage({
          key: 'adminCid',
          data: res.data.bike.cid,
        })
        wx.hideLoading();
        if(res.data.status == '101'){
          wx.showToast({
            title: '后台没有当前车辆！',
            icon: 'none'
          })
        }else{
          if (that.data.sign == '1' && !res.data.result.bool){
            wx.showModal({
              title: '提示',
              content: '该车暂无第三方数据，请换车！',
              showCancel: false,
            })
          } else {
            if (res.data.msg == '有订单！') {
              that.setData({
                orderId: res.data.order.orderId,
              })
            }
            wx.navigateTo({
              url: '/pages/administrators/administrators?&sign=' + that.data.sign + '&mark=' + res.data.sign + '&code=' + e + '&orderId=' + that.data.orderId + '&isSupre=' + res.data.isSuper,
            })
          }
        }
      }
    })
  },

  //车辆信息
  infoDdc: function(code){
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/bike/getCid',
      data: {
        code: code
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == 102){
          that.setData({
            cid: res.data.bike.cid
          })
          //存储cid到
          wx.setStorage({
            key: 'cid',
            data: that.data.cid,
          })
          // 获取token
          wx.request({
            url: 'https://api.gpslink.cn/Token',
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            dataType: 'json',
            data: {
              username: that.data.cid,
              password: "123456",
              grant_type: "password",
              scope: "single"
            },
            success: (res) => {
              console.log(res)
              that.setData({
                token: 'bearer ' + res.data.access_token
              })
              //存储第一次获取的token
              wx.setStorage({
                key: 'first-token',
                data: that.data.token,
              })
              //获取设备所有信息
              console.log(that.data.cid)
              wx.request({
                url: 'https://api.gpslink.cn/api/Point/Last?cid=' + that.data.cid,
                method: "GET",
                header: {
                  'content-type': 'application/json',
                  'Authorization': that.data.token
                },
                success: (res) => {
                  console.log(res);
                  that.findOrder(code);
                  app.globalData.valData = res.data;
                  console.log(app.globalData.valData);
                }
              })

            }
          })
        }else {
          wx.showModal({
            title: '提示',
            content: '暂无该车信息，请联系管理员！！',
            showCancel: false,
          })
          wx.hideLoading();
        }
        
      },
    })
  }
})