// pages/waitRecord/waitRecord.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parId: '',
    flag: '',
    show: '',
    waits: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    that.setData({
      parId: options.parId
    })
    that.record();
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

  // 等待提现记录
  record: function () {
    let that = this;
    console.log(that.data.parId);
    wx.request({
      url: app.globalData.baseUrl + '/Wd/getWd',
      method: 'POST',
      data: {
        parId: that.data.parId
        // parId: '1748'
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res)
        if (res.data.status === 102) {
          let waitArry = res.data.waits;
          console.log(waitArry.length);
          if (waitArry.length > 0) {
            that.setData({
              flag: true,
              show: false,
              waits: waitArry
            })
          } else {
            that.setData({
              flag: false,
              show: true,
            })
          }
        } else {
          that.setData({
            flag: false,
            show: true,
          })
        }
      }

    })
  }

})