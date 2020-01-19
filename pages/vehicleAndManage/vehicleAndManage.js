// pages/vehicleAndManage/vehicleAndManage.js
import { Throttle } from '../../utils/util.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  confirmUnlock: new Throttle().throttle(function () {
    wx.navigateTo({
      url: '/pages/confirmUnlock/confirmUnlock',
    })
  }, 1000),

  carPark: new Throttle().throttle(function () {
    wx.navigateTo({
      url: '/pages/carPark/carPark',
    })
  }, 1000),

  vehicleList: new Throttle().throttle(function () {
    wx.navigateTo({
      url: '/pages/vehicleList/vehicleList',
    })
  }, 1000),

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
})