// conponents/rentCar/mapCoverIcon/index.js
import { Navigate, Common, Throttle } from '../../../utils/util.js';
let navigate = new Navigate();
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    adminShow: {
      type: Boolean,
      value: true
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    valData:'',
    flag: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //联系管理员
    toAdmin: new Throttle().throttle(function () {  //需判断是否是管理员
      let that = this;
      console.log(app.globalData.loginStatus);
      console.log(app.globalData.falge)
      if (app.globalData.loginStatus || !app.globalData.falge){
        console.log('状态为' + app.globalData.loginStatus + ',是否授权' + app.globalData.falge)
        let myEventDetail = true;
        that.triggerEvent('myevent', myEventDetail);
      }else {
        console.log('状态为' + app.globalData.loginStatus + ',登录状态')
        wx.showLoading({
          title: '加载中',
          mask: true,
        })
        console.log(app.globalData.lqoSession);
        wx.request({
          url: app.globalData.baseUrl + '/Admin/select',
          method: 'GET',
          data: { lqoSession: app.globalData.lqoSession },
          header: {
            "Content-Type": "application/json"
          },
          success: function (res) {
            console.log(res)
            if(res.data == 0){
              wx.showModal({
                title: '错误',
                content: '没有该用户信息。。',
              })
            }
            else if(res.data == 1){
              wx.navigateTo({
                url: '/pages/admin/admin',
              })
            }else if(res.data == 2){
              wx.showModal({
                title: '提示',
                content: '您没有管理员权限',
              })
            }
          },
          fail:function(res){
            wx.showModal({
              title: '提示',
              content: '网络出问题啦！！！',
            })
          },
          complete: function(){
            wx.hideLoading();
          }
        })
      }
    }, 1000),

    //客服电话
    telephoneNumber: new Throttle().throttle(function () {
      wx.makePhoneCall({
        phoneNumber: '400-164-1319',
        success: function () {
          console.log("拨打电话成功！")
        },
        fail: function () {
          console.log("拨打电话失败！")
        }
      })
    }, 1000),
    
    //跳转至用户中心
    toUserCenter: new Throttle().throttle(function() {
      let that = this;
      if (app.globalData.loginStatus || !app.globalData.falge) {
        console.log('状态为' + app.globalData.loginStatus + ',是否授权' + app.globalData.falge)
        let myEventDetail = true;
        that.triggerEvent('myevent', myEventDetail);
      } else {
        console.log('状态为' + app.globalData.loginStatus + ',登录状态')
        navigate.toSomeWhere('/pages/mine/mine');
      }
    }, 1000),

    //回到初始位置
    toReset() {
      let mpCtx = wx.createMapContext("map");
          mpCtx.moveToLocation();
      const myEventDetail = {}
      const myEventOption = {}
      this.triggerEvent('reset', myEventDetail, myEventOption)
    },

    //管理员扫码助力车开锁
    toPeriphery: new Throttle().throttle(function () {
      let that = this;
      wx.showToast({
        title: '该功能暂未开发！请等待',
        icon: 'none'
      })
    }, 1000),
  }
})
