// pages/myIncome/myIncome.js
import { CheckIncome, Throttle } from '../../utils/util.js';
import rentCar from '../../service/rentCar.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parId:'',
    balance: 0,
    sum: 0,
    TotastBg: true,
    Totast: true,
    value: '',
    flag: true,
    Tips: '请输入提现金额',
    mark: false,
    deposit: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let that = this;
    that.setData({
      parId: options.parId,
    })
    wx.showLoading({
      title: '加载中',
      mask: 'true',
    })
    that.freshIncome();
    that.freshWithdrawals();
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    
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
    let that = this;
    that.freshIncome();
    that.freshWithdrawals();
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

  //点击 收益体现 按钮
  toCashWithdrawal: new Throttle().throttle(function () {
    var time = parseInt(new Date().getHours());
    if(time >= 1 && time < 23){
      let balance = this.data.balance;
      if (balance < 100) {
        wx.showToast({
          title: '收益小于100 不可提现',
          icon: 'none',
        })
      } else {
        this.setData({
          TotastBg: false,
          Totast: false,
          value: ''
        })
      }
    }else{
      wx.showModal({
        title: '提示',
        content: '当前不在提现时间内，提现时间为:凌晨1:00——晚上23:00',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }
  }, 1000),

  //隐藏模态框
  hiddenTotast() {
    this.setData({
      TotastBg: true,
      Totast: true,
      value: ''
    })
  },

  // 获取表单数据
  formValue: function (e) {
    console.log(e)
    let that = this;
    that.setData({
      value: e.detail.value
    })
    var value = e.detail.value;
    // 校验表单数据是否合法
    let util = new CheckIncome();
    console.log(value)
    util.checkNumber(value, that);
  },

  //提交金额
  submitMoney: new Throttle().throttle(function (e) {
    let that = this;
    that.setData({
      flag: true,
    })
    wx.showLoading({
      title: '提现中',
      mask: true,
    });

    let value = that.data.value;
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    let time = rentCar.timestampToTime(timestamp);

    console.log(value, app.globalData.lqoSession, value, time);

    wx.request({
      url: app.globalData.baseUrl + '/Wd/addWd',
      method: 'POST',
      data: {
        lqoSession: app.globalData.lqoSession,
        amount: parseInt(value),
        // time: time
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        let amount = res.data.amount;
        let balance = res.data.balance.amount
        that.setData({
          TotastBg: true,
          Totast: true,
          balance: res.data.balance.amount,
        })
        if(res.data.status == 102){
          wx.showModal({
            title: '提示',
            content: '提现成功！',
            showCancel: false,
          })
        } else if(res.data.status == 103){
          wx.showModal({
            title: '提现失败，今日提现金额还剩' + amount + '元',
            showCancel: false,
          })
        } else if (res.data.status == 101){
          wx.showModal({
            title: '提现失败,账户剩余金额为' + balance + '元',
            showCancel: false,
          })
        } else {
          wx.showModal({
            title: '提现失败,请重新尝试！',
            showCancel: false,
          })
        }
      },
      fail: () => { },
      complete: () => {
        wx.hideLoading();
        that.freshWithdrawals();
      }
    })
  }, 1000),

  //刷新收益
  freshIncome: function(){
    let that = this;
    if (app.globalData.loginStatus == '0') {
      wx.request({
        url: app.globalData.baseUrl + '/user/getUser',
        data: {
          lqoSession: app.globalData.lqoSession,
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: (res) => {
          console.log(res);
          let parBikeNum = res.data.partner.partnerVehicle,
            balance = res.data.partner.balance.amount,
            // parId = res.data.partner.partnerId,
            userId = res.data.user.userId;
          that.setData({
            // parId: parId,
            balance: balance,
          })
          if (res.data.partner.yajinMode == 1){
            let deposit = (res.data.partner.touzijine) / (1095);
            deposit = deposit.toFixed(2);
            if (deposit < 0) {
              that.setData({
                mark: true,
                deposit: 0,
                balance: that.data.balance
              })
            } else {
              that.setData({
                mark: true,
                deposit: deposit,
                balance: that.data.balance
              })
            }
          }else{
            that.setData({
              mark: false,
            })
          }
        }
      })
    }
  },
  //刷新提现
  freshWithdrawals: function () {
    let that = this;
    if (app.globalData.loginStatus == '0') {
      wx.request({
        url: app.globalData.baseUrl + '/Wd/findSum',
        data: {
          lqoSession: app.globalData.lqoSession,
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded" 
        },
        method: 'POST',
        success: (res) => {
          let sum = res.data
          that.setData({
            sum: sum,
          })
        }
      })
    }
  }

})