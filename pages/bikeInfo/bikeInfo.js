// pages/bikeInfo/bikeInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bikeInfo: [],
    array: ['大理', '三亚', '桂林'],
    index: 0,
    bikeSort: [],
    mark: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.showBike(that.data.array[that.data.index], that.data.index)
  },

  //选择器函数
  bindPickerChange: function (e) {
    let that = this;
    that.showBike(that.data.array[e.detail.value],e.detail.value)
  },

  //显示车辆信息
  showBike:function(city,ind){
    let that = this;
    let lists = [];
    lists = wx.getStorageSync('bikeInfo');
    console.log(lists)
    lists.forEach(list => {
      if (list.area == city) {
        that.setData({
          index: ind,
          bikeSort: list
        })
      }
    })
    console.log(that.data.bikeSort)
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