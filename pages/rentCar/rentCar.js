// pages/rentCar/rentCar.js
import { Common, Navigate, Throttle } from '../../utils/util.js';
import rentCar from '../../service/rentCar.js';
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: '',
    latitude: '',
    enableZoom: true,
    markers: [],
    polyline: [],
    showLocation: true,
    scale: 18,
    valData: '',
    flag: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showModal: false,
    showBubble: false,
    jumpData:[
      {
        name: '美团',
        imgHeight: 30,
        imgUrl: '/assets/images/meituan.png',
        isBodor: true,
        appId: 'wxde8ac0a21135c07d',
      }, {
        name: '菜鸟裹裹',
        imgHeight: 34,
        imgUrl: '/assets/images/cainiao.png',
        isBodor: true,
        appId: 'wx760bd8330303995c',
      }, {
        name: '饿了么',
        imgHeight: 55,
        imgUrl: '/assets/images/eleme.png',
        isBodor: true,
        appId: 'wxece3a9a4c82f58c9',
      }, {
        name: '滴滴出行',
        imgHeight: 47,
        imgUrl: '/assets/images/Didi.png',
        isBodor: false,
        appId: 'wxaf35009675aa0b2a',
      }
    ]
  },

  // 弹出框蒙层截断touchmove事件
  preventTouchMove: function () { },
  // 隐藏模态对话框
  hideModal: function () {
    this.setData({
      showModal: false,
      disabled: false,
      showBubble: false,
    });
  },
  // 对话框取消按钮点击事件
  onCancel: function () {
    let that = this;
    console.log('点击取消');
    wx.showModal({
      title: '提示',
      content: '取消登录！',
      showCancel: false,
    })
    that.hideModal();
    that.setData({
      disabled: false
    })
  },
  // 对话框确认按钮点击事件
  bindGetUserInfo: function (e) {
    let that = this;
    console.log('点击确认 授权');
    if (e.detail.userInfo) {
      console.log('用户允许授权')
      app.globalData.userInfo = e.detail.userInfo
      app.globalData.encryptedData = e.detail.encryptedData;
      app.globalData.iv = e.detail.iv;
      app.globalData.falge = true;
      wx.showToast({
        title: '授权成功',
        icon: 'success',
        duration: 2000
      })
      if(app.globalData.loginStatus){
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }else {
        console.log('状态为' + app.globalData.loginStatus + ',登录状态')
      }
    } else {
      console.log('用户按了拒绝按钮')
      wx.showModal({
        title: '提示',
        content: '取消授权！',
        showCancel: false,
      })
    }
    that.hideModal();
  },

  //子组件传值
  onCheck: function (e) {
    console.log(e.detail);
    if(e.detail){
      this.setData({
        showModal: true
      })
    }
  },

  jumpBtn: function () {
    let that = this;
    that.setData({
      showBubble: !that.data.showBubble,
    })
  },

  //选择跳转不同小程序
  selectBtn: new Throttle().throttle(function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    console.log('跳转至' + that.data.jumpData[index].name + '小程序')
    wx.showLoading({
      title: '加载中',
    })

    wx.navigateToMiniProgram({
      appId: that.data.jumpData[index].appId,
      path: '',//打开的页面路径，如果为空则打开首页
      extraData: {
        foo: 'bar'//需要传递给目标小程序的数据，目标小程序可在 App.onLaunch，App.onShow 中获取到这份数据
      },
      envVersion: 'release',
      success(res) {
        console.log('打开成功');
        that.setData({
          showBubble: false,
        })
      },
      complete(res) {
        wx.hideLoading()
      }
    })

  }, 500),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let city = app.globalData.address;
    that.getmarkers(city);
    that.getPostion();
    qqmapsdk = new QQMapWX({
      key: 'YTGBZ-EDBKG-RZZQN-IY4IU-XREHS-PWFRX'
    });

    //登录状态为0时，判断用户身份
    console.log(app.globalData.loginStatus)
    if (app.globalData.loginStatus == '0'){
      wx.request({
        url: app.globalData.baseUrl + '/Admin/select',
        method: 'GET',
        data: { lqoSession: app.globalData.lqoSession },
        header: {
          "Content-Type": "application/json"
        },
        success: function (res) {
          console.log(res)
          if (res.data == 1) {
            console.log('管理员')
            that.setData({
              flag: false,
            })
          } else if (res.data == 2) {
            console.log('普通用户')
            that.setData({
              flag: true,
            })
          }
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '网络出问题啦！！！',
          })
        },
      })
    }    
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(res);
        // 存经纬度
        wx.setStorage({
          key: 'lat',
          data: res.latitude,
        })
        wx.setStorage({
          key: 'lng',
          data: res.longitude,
        })
      },
      fail: function (res) {
        console.log("位置获取失败");
      }
    })
  },

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 创建map上下文  保存map信息的对象
    this.mapCtx = wx.createMapContext('myMap');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.loginStatus == '0'){
      console.log('登录状态');
      wx.request({
        url: app.globalData.baseUrl + '/order/getOrder',
        method: 'POST',
        data: {
          lqoSession: app.globalData.lqoSession
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res)

          wx.hideLoading();
          //判断订单状态
          if (res.data.status == '102') {
            wx.showToast({
              title: '有未完成订单!',
              icon: 'none'
            })
            wx.redirectTo({
              url: '/pages/riding/riding',
            })
          }
        }
      })
    }
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
  //重新定位
  toReset: function () {
    rentCar.toReset(this);
  },
  getPostion: function () {
    rentCar.getPostion(this);
  },

  //获取 marker点  代表还车地点
  getmarkers: function (e) {
    let that = this;
    console.log(e);
    wx.request({
      url: app.globalData.baseUrl + '/place/getPlace',
      method: 'GET',
      data: {
        address: e
      },
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        if (res.data.status === 101) {
          wx.showToast({
            title: '该地区没有停放点',
            icon: 'none'
          })
        } else {
          let item = res.data;
          let listmarker = [];
          for (var i = 0; i < item.length; i++) {
            listmarker.push({
              iconPath: "/assets/images/bike.png",
              id: item[i].pId,
              latitude: item[i].latitude,
              longitude: item[i].longitude,
              width: 25,
              height: 25
            })
          }
          that.setData({
            markers: listmarker
          })
          console.log(that.data.markers)
        }
      }
    })
  },

  //marker绑定事件
  markertap(e) {
    let that = this;
    console.log(e.markerId, that.data.latitude, that.data.markers, that.data.longitude)
    let item = that.data.markers;
    let id = e.markerId - 1;
    let endlng = item[id].longitude,
      endlat = item[id].latitude,
      endstr = endlat + ',' + endlng;
    let starlng = that.data.longitude,
      starlat = that.data.latitude,
      starstr = starlat + ',' + starlng;
    console.log(starlat)
    that.pointLine(starstr, endstr)
  },

  //规划路线
  pointLine: function (start, dest) {
    console.log(start, dest);
    var that = this;
    qqmapsdk.direction({
      mode: 'walking',
      from: start,
      to: dest,
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline, pl = [];
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        that.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#3CBCA3',
            width: 5
          }]
        })
      },
    });
  },

})