// pages/riding/riding.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: 104.238345,
    latitude: 30.558296,
    markers: [],
    showLocation: true,
    nearestPointName:'南城门',
    distance:0.009,
    cid:'',
    flag: true,
    sign: '',
    mark: true,
    code: '',
    status: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let sign = wx.getStorageSync("sign");

    //判断用户身份
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
            mark: false,
          })
        } else if (res.data == 2) {
          console.log('普通用户')
          that.setData({
            mark: true,
          })
          if (sign == '1') {
            that.setData({
              flag: true,
            })
          } else {
            that.setData({
              flag: false,
            })
          }
        }
        that.setData({
          status: res.data
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '网络出问题啦！！！',
        })
      },
    })
    
    that.getPosition();

    that.setData({
      cid: wx.getStorageSync('cid'),
      sign: sign,
    })
  },
    
  
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  // showPickerDate(e) {
  //   // 调用子组件中methods的onshow方法
  //   this.selectComponent('#picker-date').onshow()
  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/order/getOrder',
      method: 'post',
      data: {
        lqoSession: app.globalData.lqoSession
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res){
        console.log(res);
        if (res.data.status == 103){
          wx.redirectTo({
            url: '/pages/rentCar/rentCar',
          })
        } else if(res.data.status == '102'){
          console.log(res.data.bike.scanCode)
          let str = res.data.bike.scanCode;
          let codeType = str.slice(8, 11);
          let codeNo = str.substring(str.length - 6);
          let code = ''
          if(codeType == 'ddc'){
            code = 'DDC' + codeNo
          }else {
            code = 'ZLC' + codeNo
          }
          console.log(codeType, codeNo, code)
          that.setData({
            code: code
          })
        }
      }
    })
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
  //获取当前位置
  getPosition :function (){
    wx.showLoading({
      title: '定位中',
      mask: true
    })
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: (res) => {
        let latitude = res.latitude;
        let longitude = res.longitude;
        this.setData({
          latitude,
          longitude,
          markers: [{
            id: 0,
            latitude: res.latitude,
            longitude: res.longitude,
            iconPath: '/assets/images/bike.png',
            width: '91rpx',
            height: '62rpx',
          }]
        })
      },
      fail: () => {
        wx.showToast({
          title: '定位失败',
          icon: "none"
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  }
})