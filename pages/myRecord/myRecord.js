// pages/myRecord/myRecord.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    record: [],
    time: [],
    msg:'没有更多了...',
    repairList : [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/order/journey',
      method: 'POST',
      dataType: 'json',
      data: {
        lqoSession: app.globalData.lqoSession,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102') {
          let record = res.data.orders,
            repairList = res.data.repairList.reverse();

          record.forEach(function (item){
            console.log(item.diffAreaPrice)
            item.diffAreaPrice == null ? item.diffAreaPrice = 0 : item.diffAreaPrice=item.diffAreaPrice;
          })

          record = record.reverse();

          that.setData({
            record: record,
            repairList: repairList
          })
          console.log(that.data.repairList)
          let time = res.data.times.reverse();
          for (let i = 0; i < time.length; i++) {
           time[i]= that.change(time[i])
          }
          that.setData({
            time: time
          })
          console.log(that.data)
        }
      },
      fail:(res)=>{
        that.setData({
          msg:'网络出错了...'
        })
      }
    })
  },
  change: function (time) {
    var t = 0;
    if (time > -1) {
      var hour = Math.floor(time / 3600);
      var min = Math.floor(time / 60) % 60;
      var sec = time % 60;
      if (hour < 10) {
        t = '0' + hour + "时";
      } else {
        t = hour + "时";
      }

      if (min < 10) {
        t += "0";
      }
      t += min + "分";
      if (sec < 10) {
        t += "0";
      }
      t += sec + "秒";
    }
    time =t
    return time;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})