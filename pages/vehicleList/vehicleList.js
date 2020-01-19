// pages/vehicleList/vehicleList.js
var qqmap = require('../../libs/qqmap-wx-jssdk.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: '',
    vehicleList: [],
    flag: false,
    token: ''
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
  findList: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/bike/findBikeByRegionStartOrState',
      method: 'POST',
      data: {
        lqoSession: app.globalData.lqoSession,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        let list = res.data.bikeList;
        let address = res.data.adminRegion;
        let arry = [];
        that.setData({
          address: address,
        })
        if (list.length == 0){
          that.setData({
            flag: true,
            vehicleList: list,
          })
        }
        else{
          list.map(((item, index) => {
            arry.push(Object.assign({}, item, { check: 0, sign: 0, address: '' }))
          }))
          for(var i = 0; i < arry.length; i++){
            let str = arry[i].scanCode;
            let str1 = str.substring(str.length - 9);
            let str2 = str1.slice(0, 3);
            if(str2 == 'ddc'){
              arry[i].scanCode = "DDC:" + str1.slice(3);
              arry[i].sign = 2;
            }else{
              arry[i].scanCode = "ZLC:" + str1.slice(3);
              arry[i].sign = 1;
            }
          }
          that.setData({
            vehicleList: arry,
          })
        }
        console.log(that.data.vehicleList)
      },
      complete: function () {
        setTimeout(function () {
          wx.hideLoading();
        }, 2000);
      }
    })
  },
  
  //选择车辆
  check_location: function(e){
    let that = this;
    console.log(e.currentTarget.dataset);
    let index = e.currentTarget.dataset.index;
    let sign = that.data.vehicleList[index].sign;//获取当前点击的类型
    let cid = that.data.vehicleList[index].cid;//获取当前点击车辆的cid

    if (that.data.vehicleList[index].check == 1) {
      that.data.vehicleList[index].check = 0;
    } else {
      that.data.vehicleList[index].check = 1;
      if (sign == 2) {
        that.findDdc(cid,index);
      }
      else{
        console.log("助力车经纬度");
        that.findZlc(cid,index)
      }
    }

    that.setData({
      vehicleList: that.data.vehicleList,
    });
  },

  //查询电动车车辆位置信息
  findDdc: function(e,index){
    let that = this;
    //获取token
    wx.request({
      url: 'https://api.gpslink.cn/Token',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      dataType: 'json',
      data: {
        username: e,
        password: "123456",
        grant_type: "password",
        scope: "single"
      },
      success: (res) => {
        console.log(res);
        that.setData({
          token: 'bearer ' + res.data.access_token
        })
        //获取经纬度
        wx.request({
          url: 'https://api.gpslink.cn/api/Point/LastGps?cid=' + e,
          method: "GET",
          header: {
            'content-type': 'application/json',
            'Authorization': that.data.token
          },
          success: (res) => {
            console.log(res)
            let lat = res.data.blat;
            let lng = res.data.blng;
            console.log(lat,lng);
            that.inverseAdd(lat,lng,index)
          }
        })
      }
    })
  },

  //查询助力车车辆信息
  findZlc : function (e,index){
    console.log(e,index);
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/bike/getBikeStatus',
      method: 'POST',
      data: {
        cid: e,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res){
        console.log(res.data.result)
        if(res.data.result == ''){
          console.log("定位失败");
          wx.showToast({
            title: '定位失败',
            icon: 'none'
          })
          that.data.vehicleList[index].address = '未知';

          that.setData({
            vehicleList: that.data.vehicleList,
          });
        }else{
          console.log(JSON.parse(res.data.result))
          let result = JSON.parse(res.data.result);
          let lat = result.latitude;
          let lng = result.longitude;
          console.log(lat, lng);
          that.inverseAdd(lat, lng, index)
        }
      }
    })
  },

  //腾讯逆地址解析
  inverseAdd: function (lat,lng,index){
    let that = this;
    // 实例化API核心类
    var demo = new qqmap({
      key: 'YTGBZ-EDBKG-RZZQN-IY4IU-XREHS-PWFRX'
    });
    demo.reverseGeocoder({
      //腾讯地图api 逆解析方法 首先设计经纬度
      location: {
        latitude: lat,
        longitude: lng
      },
      //逆解析成功回调函数
      success: function (res) {
        console.log(res);
        // let street_number = res.result.address_component.street_number;
        // let street = res.result.address_component.street;
        // let province = res.result.address_component.province;
        // console.log(street_number)
        // if (street_number == ''){
        //   console.log('定位不准确!');
        //   wx.showToast({
        //     title: '定位不准确',
        //     icon: 'none'
        //   })
        //   if (street == ''){
        //     that.data.vehicleList[index].address = province;
        //   }else{
        //     that.data.vehicleList[index].address = street;
        //   }
        // }else{
        //   that.data.vehicleList[index].address = street_number;
        // }
        let rough = res.result.formatted_addresses.rough;
        that.data.vehicleList[index].address = rough;
        that.setData({
          vehicleList: that.data.vehicleList,
        });
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: '定位获取失败！',
          icon: 'none'
        })
      }
    })
  },
})