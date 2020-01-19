// conponents/mine/userCenter/index.js
import { Navigate, Throttle } from '../../../utils/util.js';
let navigate = new Navigate();
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // parBikeNum: Number,
    // parId: Number,
    // parIncome: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: {},
    phone: null,
    trip: 0,
    parBikeNum: '',
    income: '',
    parId: '',
    balance: '',
    status: ''
  },
  attached: function(options) { //加载用户信息
    console.log(app.globalData.userInfo)
    wx.showLoading({
      title: '加载中。。。',
    })
    this.setData({
      userInfo: app.globalData.userInfo
    })
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/user/getUser',
      method: 'post',
      data: {
        lqoSession: app.globalData.lqoSession
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        console.log(res);
        that.setData({
          phone: res.data.user.userPhone,
          status: res.data.status,
        })
        if (res.data.status === 102) {
          that.setData({
            parBikeNum: res.data.partner.partnerVehicle,
            income: res.data.income,
            parId: res.data.partner.partnerId,
            balance: res.data.partner.balance.amount,
            moneyId: res.data.partner.moneyId,
          })
        }
      },
      complete: function(){
        wx.hideLoading();
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    toDeposit: new Throttle().throttle(function () {
      wx.request({
        url: app.globalData.baseUrl + '/order/getOrder',
        method: 'post',
        data: {
          lqoSession: app.globalData.lqoSession
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          console.log(res)
          if (res.data.status == '102') {
            wx.showModal({
              title: '当前预授权',
              content: res.data.order.prepayment +'元',
            })
          }
          else if (res.data.status == '103'){
            wx.showToast({
              title: '您还没有订单！',
              icon:'none'
            })
          }
          else{
            wx.showToast({
              title: '出错了',
              icon:'none'
            })
          }
        }
      })
    }, 1000),

    travelRecord: new Throttle().throttle(function () {
      wx.navigateTo({
        url: '/pages/myRecord/myRecord',
      })
    }, 1000),

    myassets: new Throttle().throttle(function () {
      let that = this;
      console.log(that.data.status,that.data.parBikeNum)
      if(that.data.status === 102){
        wx.navigateTo({
          url: '/pages/myAssets/myAssets?parBikeNum=' + that.data.parBikeNum + '&income=' + that.data.income + '&moneyId=' + that.data.moneyId,
        })
      }else{
        wx.showToast({
          title: '您还不是购车人',
          icon: 'none'
        })
      }
    }, 1000),

    myincome: new Throttle().throttle(function () {
      let that = this;
      console.log(that.data.parId);
      if(that.data.status === 102){
        wx.navigateTo({
          url: '/pages/myIncome/myIncome?parId=' + that.data.parId,
        })
      }else{
        wx.showToast({
          title: '您还不是购车人',
          icon: 'none'
        })
      }
    }, 1000),
  }
})