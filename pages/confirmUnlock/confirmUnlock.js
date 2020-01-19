// pages/confirmUnlock/confirmUnlock.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: '南城门',
    flag: false,
    vehicleList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.findList();
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

  //查询车辆列表
  findList: function(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/bike/findBikeByRegionStartOrState',
      method: 'POST',
      data: {
        lqoSession: app.globalData.lqoSession,
        state: 1,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        let list = res.data.bikeList;
        let address = res.data.adminRegion;
        let arry = [];
        console.log(list)
        that.setData({
          address: address,
        })
        if (list.length == 0){
          that.setData({
            flag: true,
            vehicleList: list,
          })
        }else{
          list.map(((item, index) => {
            arry.push(Object.assign({}, item, { check: 0 }))
          }))
          for (var i = 0; i < arry.length; i++) {
            let str = arry[i].scanCode;
            let str1 = str.substring(str.length - 9);
            let str2 = str1.slice(0, 3);
            if (str2 == 'ddc') {
              arry[i].scanCode = "DDC:" + str1.slice(3);
            } else {
              arry[i].scanCode = "ZLC:" + str1.slice(3);
            }
          }
          that.setData({
            vehicleList: arry,
          })
        }
        console.log(that.data.vehicleList)
      },
      complete: function(){
        wx.hideLoading();
      }
    })
  },

  //选择车辆后加样式  添加check属性
  select_date: function(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;

    if (that.data.vehicleList[index].check == 1) {
      that.data.vehicleList[index].check = 0;
    } else{
      that.data.vehicleList[index].check = 1;
    }

    that.setData({
      vehicleList: that.data.vehicleList,
    });
  },

  //确认开锁
  confirm: function(){
    let that = this;
    let list = that.data.vehicleList;
    let data = list.filter(function (item) {
      return item.check == 1;
    })
    console.log(data);
    let arry = [];
    for(let i = 0; i < data.length; i++){
      var obj = {
        cId: data[i].cId,
        bikeState: '2',
      }
      arry.push(obj);
    }
    console.log(arry);
    wx.request({
      url: app.globalData.baseUrl + '/bike/updateByParam',
      method: 'POST',
      data: {
        lqoSession: app.globalData.lqoSession,
        list: arry
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res);
        if (res.data.status == 102) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1000
          })
          that.findList();
        } else if (res.data.status == 100){
          wx.showToast({
            title: '请选择车辆',
            icon: 'none'
          })
        }
      }
    })
  }

})