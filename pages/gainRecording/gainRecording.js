// pages/gainRecording/gainRecording.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    endDate: '',
    parId: '',
    recordList: [],
    flag: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      date: that.getNowFormatDate(),
      endDate: that.getNowFormatDate(),
      parId: options.parId,
    })
    that.incomeCode();
  },

  //时间选择器
  // bindDateChange: function (e) {
  //   let that = this;
  //   that.setData({
  //     date: e.detail.value
  //   })
  //   that.incomeCode();
  // },

  //获取当前年月
  getNowFormatDate: function() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if(month >= 1 && month <= 9) {
      month = "0" + month;
    }
    var currentdate = year + seperator1 + month;
    return currentdate;
  },

  //查询收益记录
  incomeCode() {
    let that = this;
    console.log(that.data.parId, that.data.date);
    wx.request({
      url: app.globalData.baseUrl + '/income/findIncome?partnerId=' + that.data.parId + '&createTime=' + that.data.date,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        if (res.data.status == 102){
          let newList = [];
          res.data.data.forEach(item => {
            item.createTime = item.createTime.slice(5)
            newList.push(item)
          })
          that.setData({
            recordList: newList,
            flag: true,
          })
        }else if (res.data.status == 103){
          that.setData({
            recordList: [],
            flag: false,
          })
        }
        else if (res.data.status == 100) {
          that.setData({
            recordList: [],
            flag: false,
          })
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '错误！请重新点击进入！',
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
        console.log(that.data.recordList)
      },
      fail: () => { },
      complete: () => { }
    })
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