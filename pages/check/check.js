// pages/check/check.js
import { Throttle } from '../../utils/util.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    equid: '', //需获取
    electricQuantity: '68%', //需获取
    endurance: '41.2km',
    agree: 'false',
    flag: 'true',
    setMeal: [],
    sign: '',
    code: '',
  },
  checked: function() {
    let agree = this.data.agree;
    this.setData({
      agree: !agree
    })
  },
  insurance: function() {
    let flag = this.data.flag;
    this.setData({
      flag: !flag
    })
    console.log(flag)
  },
  selection: new Throttle().throttle(function (e) {
    console.log(e);
    console.log("选择套餐");
    //选择套餐
    if (e.target.id == 'menuuContont' || e.currentTarget.id == 'menuuContont') {
      let index = e.target.dataset.index ? e.target.dataset.index : e.currentTarget.dataset.index;
      let tcShouciSj = this.data.setMeal[index].tcShouciSj;
      let tcShouciFk = this.data.setMeal[index].tcShouciFk;
      let tcDanjia = this.data.setMeal[index].tcDanjia;
      let tcId = this.data.setMeal[index].tcId;
      let sign = this.data.sign;
      wx.setStorage({
        key: 'tcShouciSj',
        data: tcShouciSj,
      })
      wx.setStorage({
        key: 'tcShouciFk',
        data: tcShouciFk,
      })
      wx.setStorage({
        key: 'tcDanjia',
        data: tcDanjia,
      })
      wx.redirectTo({
        url: '/pages/pay/pay?tcShouciSj=' + tcShouciSj + '&tcShouciFk=' + tcShouciFk + '&tcId=' + tcId + '' + '&sign=' + sign,
      })
    }

  }, 2000),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取车辆信息
    console.log(options)
    let electricQuantity = Math.floor(options.electricQuantity) + '%'
    let endurance = Math.floor(options.electricQuantity * 180 * 0.01) + 'km'
    this.setData({
      equid: options.equid,
      electricQuantity: electricQuantity,
      endurance: endurance,
      sign: options.sign,
      code: options.code,
    })
    //存储用户扫描的code
    wx.setStorage({
      key: 'userCode',
      data: options.code,
    })
 
    let that = this,
      setMeal = that.data.setMeal;

    //获取套餐
    wx.request({
      url: app.globalData.baseUrl + '/taocan/queryTaocan',
      method: 'GET',
      data: {
        diqu: app.globalData.address,
        taocanType: that.data.sign,
      },
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        console.log(res.data.length)
        if (res.data.length == 0) {
          wx.showModal({
            title: '套餐',
            content: '暂无套餐',
            success: function (res) {
            
                wx.navigateBack({
                  delta: 1
                })
             
            }
          })
        } else {
          that.setData({
            setMeal: res.data
          })
          console.log(that.data.setMeal)
        }
      }
    })

    
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