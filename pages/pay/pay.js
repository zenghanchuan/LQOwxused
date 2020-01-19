// pages/pay/pay.js
import { Throttle } from '../../utils/util.js';
import myButton from "../../conponents/currency/myButton/index"
import rentCar from '../../service/rentCar.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    num: '300',
    tcShouciSj: '1',
    tcShouciFk: '45',
    tcId: '',
    cid: '',
    orderNo: '',
    id: '',
    disabled:false,
    sign: '',
    orderId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let tcShouciSj = this.data.tcShouciSj,
      tcShouciFk = this.data.tcShouciFk,
      tcId = this.data.tcId,
      cid = wx.getStorageSync('cid')
    this.setData({
      tcShouciSj: options.tcShouciSj,
      tcShouciFk: options.tcShouciFk,
      tcId: options.tcId,
      cid: cid,
      disabled:false,
      sign: options.sign
    })
    //存入本地
    wx.setStorage({
      key: 'sign',
      data: this.data.sign
    })
  },
  pay: new Throttle().throttle(function () {
    let that = this;
    that.setData({
      disabled: true
    })
    console.log(app.globalData.lqoSession)
    //创建订单
    wx.showLoading({
      title: '加载中...',
    })
    let cid = wx.getStorageSync('cid');
    let orderNo = wx.getStorageSync('orderNo');
    console.log(cid, orderNo)
    wx.request({
      url: app.globalData.baseUrl + '/order/returnParam',
      data: {
        num: that.data.num,
        lqoSession: app.globalData.lqoSession,
        image: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
        cid: cid,
        orderNo: orderNo,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102'){
          console.log(app.globalData.userInfo)
          // that.setData({
          //   orderNo: res.data.orderNo
          // })

          //支付
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success: (res) => {
              console.log(res)
              if (res.errMsg === 'requestPayment:ok') {
                wx.showLoading({
                  title: '加载中。。。',
                  mask: true,
                })
                if(that.data.sign == '1'){
                  console.log('助力车开锁')
                  wx.setStorageSync('lockTime', new Date().getTime())
                  let timestamp = Date.parse(new Date());
                  timestamp = timestamp / 1000;
                  let time = rentCar.timestampToTime(timestamp);
                  console.log(time)
                  //发送经纬度等信息
                  this.sendlat(time);
                }else {
                  console.log('电动车开锁');
                  //撤防
                  wx.request({
                    url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                    data: {
                      "command": "S13", //撤防            
                      "parameter": "0",
                      "comtype": 3,
                      "remarks": "撤防",
                    },
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded",
                      'Authorization': wx.getStorageSync('first-token')
                    },
                    method: 'POST',
                    dataType: 'json',
                    responseType: 'text',
                    success: (res) => {
                      console.log(res)
                      //发送开锁指令
                      wx.request({
                        url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                        data: {
                          "command": "S15", //远程解锁、锁车            
                          "parameter": "0", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                          "comtype": 3, //远程指令                
                          "remarks": "开锁",
                        },
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded",
                          'Authorization': wx.getStorageSync('first-token')
                        },
                        method: 'POST',
                        dataType: 'json',
                        responseType: 'text',
                        success: (res) => {
                          console.log(res)
                          let createTime = res.data.createtime.slice(0, 10) + ' ' + res.data.createtime.slice(11, 19)
                          console.log(createTime)
                          wx.setStorageSync('lockTime', new Date().getTime())
                          that.setData({
                            id: res.data.id
                          })
                          wx.setStorage({
                            key: 'id',
                            data: this.data.id
                          })

                          //发送经纬度等信息
                          this.sendlat(createTime);
                        },
                      })
                    },
                  })
                }
              }else {
                console.log(that.data.orderId)
                that.refund('300');
              }
            }, fail: (res) => {
              console.log(res)
              //支付取消或失败
              if (res.errMsg === 'requestPayment:fail cancel'){
                console.log('取消支付')
                //结束订单
                that.endOrder('1');
              }
              wx.hideLoading()
              this.setData({
                disabled: false
              })
            }
          })
        } else if (res.data.status == '103'){
          wx.showModal({
            title: '提示',
            content: '订单已创建，请勿重复点击！',
            showCancel: false,
          })
          this.setData({
            disabled: false
          })
        } else if (res.data.status == '100') {
          wx.showModal({
            title: '提示',
            content: '数据错误，请重试！',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/rentCar/rentCar',
                })
              } 
            }
          })
          this.setData({
            disabled: false
          })
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })  
  }, 10000),

  sendlat: function(e){
    let that = this;
    //发送经纬度等信息
    wx.showLoading({
      title: '请稍等。。。',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/getUnlockMsg',
      method: 'POST',
      dataType: 'json',
      data: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        lqoSession: app.globalData.lqoSession,
        cid: that.data.cid,
        sign: that.data.sign,
        tcId: that.data.tcId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102') {
          console.log(this.data.sign)
          // wx.removeStorageSync('orderNo'); 
          //跳转到骑行界面
          wx.redirectTo({
            url: '/pages/riding/riding',
          })
        } else if (res.data.status == '101'){
          console.log("开锁失败")
          wx.showModal({
            title: '错误',
            content: '开锁失败,将退款',
            showCancel: false,
            success: function(res){
              if (res.confirm) {
                //点击确定
                console.log("点击确定");
              }
            }
          })
          console.log(that.data.orderId)
          that.refund('300');
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '订单产生异常，请联系管理员关锁，\r\n重新操作，押金退回！',
          success: function () {
            console.log(that.data.orderId)
            that.refund('300');
          }
        })
      },
      complete: function(){
        wx.hideLoading();
      }
    })
  },
  //退款
  refund: function (e) {
    let that = this;
    wx.showLoading({
      title: '加载中。。。',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/refund',
      data: {
        price: e,
        lqoSession: app.globalData.lqoSession,
        sign: '1',
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102') {
          //结束订单
          that.endOrder();
        }
        else if (res.data.status === 101) {
          wx.hideLoading();
          wx.showToast({
            title: '退款失败！',
            icon: 'none'
          })
        }
      }
    })
  },

  //结束订单
  endOrder: function (e) {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/order/over',
      data: {
        lqoSession: app.globalData.lqoSession,
        // orderNo: that.data.orderNo,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102') {
          wx.hideLoading();
          if(e){
            wx.showToast({
              title: '订单已取消！',
            })
          }else {
            wx.showToast({
              title: '订单已结束！',
            })
          }
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/rentCar/rentCar',
            })
          }, 1000)
        }
      }
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