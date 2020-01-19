// pages/myAssets/myAssets.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 0,//车辆数
    longitude: '103.92377',
    latitude: '30.57447',
    scale: 18,
    showLocation: true,
    enableZoom: true,
    markers: [],
    m: 0, //收益车辆数
    bikeInfo: [],//判断是否确定车辆站点
    mark: true,
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log(options);
    //定位
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: function (res) {
        console.log("位置获取失败");
      }
    })

    that.setData({
      num: options.parBikeNum,
    })

    // if(options.income == 0){
    //   that.setData({
    //     num: options.parBikeNum,
    //     show: true,
    //   })
    // }else{
    //   wx.request({
    //     url: app.globalData.baseUrl + '/ownBike/findOwnBike',
    //     method: 'post',
    //     data: {
    //       partnerId: parseInt(options.moneyId),
    //     },
    //     header: {
    //       'content-type': 'application/x-www-form-urlencoded'
    //     },
    //     success: function (res) {
    //       console.log(res)
    //       if(res.data.status == 102){
    //         console.log('成功');
    //         let bikeInfo = JSON.parse(res.data.ownBike.incomeDetail)
    //         that.setData({
    //           num: res.data.ownBike.bikeNum,
    //           m: res.data.ownBike.createIncome,
    //           bikeInfo: bikeInfo,
    //         })
    //         that.getmarkers(that.data.bikeInfo);
    //         wx.setStorage({
    //           key: 'bikeInfo',
    //           data: bikeInfo,
    //         })
    //       }else{
    //         console.log('参数传入错误！')
    //       }
    //     }
    //   })
    // }
  },

  //获取markers点，代表车的位置
  getmarkers: function(e){
    console.log(e)
    let that = this;
    let listmarker = [];
    that.data.bikeInfo.forEach( item => {
      item.datas.forEach( list => {
        listmarker.push({
          iconPath: "/assets/images/bike1.png",
          latitude: list.latitude,
          longitude: list.longitude,
          width: 25,
          height: 25
        })
      })
    })
    that.setData({
      markers: listmarker
    })
    console.log(listmarker)
  },

  bickInfo: function(){
    console.log('车辆详情');
    let that = this;
    wx.navigateTo({
      url: '/pages/bikeInfo/bikeInfo',
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
})