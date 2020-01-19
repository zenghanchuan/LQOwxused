// conponents/riding/bikeFunctionBtn/index.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    comment: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    bikeStatus: '还车',
  },

  ready: function () {
    console.log(this.data);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
    returnBike: function() {
      let that = this;
      //查看是否已存在订单
      wx.showLoading({
        title: '加载中。。。',
      })
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
          console.log(res);
          
          if (res.data.status == '102') {
            //用户有订单
            if (res.data.order.orderState == '1') {
              // 状态1表示未结束订单（退钱或补钱）
              wx.hideLoading();
              var order = JSON.stringify(res.data.order);
              wx.navigateTo({
                url: '/pages/rideEnd/rideEnd?order=' + order + '&repairPrice=' + res.data.repairPrice + '&repairType=' + res.data.repairType + '&time=' + res.data.time,
              })
            } 
            else if (res.data.order.orderState == '2') {
              wx.hideLoading();
              //状态2表示未还车
              wx.showModal({
                title: '提示',
                content: '请先与管理员确认还车！',
              })
              return false;
            }
          } else if (res.data.status == '103'){
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '订单已结束',
            })
            wx.navigateTo({
              url: '/pages/riding/riding',
            })
          }
        },
        complete: function(){
          wx.hideLoading();
        }
      })
    }
  }
})