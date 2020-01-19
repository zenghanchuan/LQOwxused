// conponents/explain/loginButton/index.js
import { Throttle } from '../../../utils/util.js';
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataReady: {
      type: Boolean,
      value: true
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goRentCar: new Throttle().throttle(function () {
      let that = this;

      // //判断登录状态
      // wx.login({
      //   success: function (res) {
      //     console.log(res)
      //     if (res.code) {
      //       console.log(111)
      //       wx.request({
      //         url: app.globalData.baseUrl + '/user/getOpenid',
      //         method: 'GET',
      //         data: { js_code: res.code },
      //         header: {
      //           "Content-Type": "application/json"
      //         },
      //         success: function (res) {
      //           console.log(res)
      //           app.globalData.userinfo = res;
      //           console.log('ok');
      //           // that.globalData.haveNoData = false
      //           app.globalData.lqoSession = res.data.lqoSession;
      //           if (res.data.status == '101') {
      //             app.globalData.loginStatus = 1;
      //           } else if (res.data.status == '102') {
      //             app.globalData.loginStatus = 0;
      //             //判断是否存在UnionId
      //             if (res.data.unionId == null || res.data.unionId == '') {
      //               console.log(res.data.lqoSession)
      //               console.log(app.globalData.encryptedData)
      //               console.log(app.globalData.iv)
      //               if (app.globalData.encryptedData && app.globalData.iv) {
      //                 console.log('已获取')
      //                 wx.request({
      //                   url: app.globalData.baseUrl + '/user/updateUnionId',
      //                   method: 'GET',
      //                   data: {
      //                     lqoSession: res.data.lqoSession,
      //                     encryptedData: (app.globalData.encryptedData),
      //                     iv: app.globalData.iv
      //                   },
      //                   header: {
      //                     "Content-Type": "application/json"
      //                   },
      //                   success: function (res) {
      //                     console.log(res)
      //                     if (res.data.status == '102') {
      //                       that.globalData.flag = false;//无需再调用uid获取更新
      //                     } else {
      //                       that.globalData.flag = true;//需重新调用uid相关接口
      //                     }
      //                   },
      //                   fail: function (res) {
      //                     that.globalData.flag = true;//需重新调用uid相关接口
      //                   }
      //                 })
      //               } else {
      //                 wx.showLoading({
      //                   title: '正在获取',
      //                 })
      //                 that.globalData.flag = true;//需重新调用uid相关接口
      //               }
      //             }
      //             else {
      //               that.globalData.flag = false;
      //             }
      //           }
      //         }
      //       })
      //     }
      //     else {
      //       console.log('登录失败！' + res.errMsg)
      //     }
      //   },
      //   fail: function (res) {
      //     wx.showModal({
      //       title: '错误',
      //       content: '网络错误',
      //     })
      //   },
      //   complete: function (res) { },
      // })

      wx.redirectTo({
        url: '/pages/rentCar/rentCar'
      })

      // console.log(app.globalData.baseUrl, app.globalData.loginStatus, app.globalData.address)
      // console.log(app.globalData.flag)
      // console.log(app.globalData.userinfo)
      // var info = app.globalData.userinfo;
      // if (app.globalData.loginStatus == '0' && app.globalData.flag == true ){
      //   if (info.data.unionId == null || info.data.unionId == '') {    //判断数据库当前用户数据是否有UnionId
      //     // console.log(res.data.lqoSession)
      //     console.log(app.globalData.encryptedData)
      //     console.log(app.globalData.iv)
      //     if (app.globalData.encryptedData && app.globalData.iv) {
      //       console.log('已获取')
      //       wx.request({
      //         url: app.globalData.baseUrl + '/user/updateUnionId',
      //         method: 'GET',
      //         data: {
      //           lqoSession: app.globalData.lqoSession,
      //           encryptedData: app.globalData.encryptedData,
      //           iv: app.globalData.iv
      //         },
      //         header: {
      //           "Content-Type": "application/json"
      //         },
      //         success: function (res) {
      //           console.log(res)
      //           if (res.data.status == '102') {
      //             wx.redirectTo({
      //               url: '/pages/rentCar/rentCar',
      //             })
      //           }
      //           else {
      //             wx.redirectTo({
      //               url: '/pages/rentCar/rentCar',
      //             })
      //           }
      //         }
      //       })
      //     } else {
      //       wx.showModal({
      //         title: '提示',
      //         content: '未获取uid',
      //       })
      //     }
      //   }
      //   wx.redirectTo({
      //     url: '/pages/rentCar/rentCar?',
      //   })
      // }
      // else if (app.globalData.loginStatus == '0' && app.globalData.flag == false){
      //   wx.redirectTo({
      //     url: '/pages/rentCar/rentCar'
      // }
      // else if (app.globalData.loginStatus == '1'){
      //   wx.redirectTo({
      //     url: '/pages/login/login',
      //   })
      // }
      // else if (app.globalData.falge == false){
      //   wx.showModal({
      //     title: '提示',
      //     content: '请先授权登录',
      //   })
      // }
    }, 1000),
  },
})
