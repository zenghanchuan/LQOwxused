// conponents/explain/legalDocument/legalDocument.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    userService: false,
    rental: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickUser: function () {
      let that = this;
      that.setData({
        userService: !that.data.userService
      })
      that.triggerEvent('myeventUser', { userService : that.data.userService})
    },
    clickRental: function () {
      let that = this;
      that.setData({
        rental: !that.data.rental
      })
      that.triggerEvent('myeventRental', { rental: that.data.rental })
    }
  }
})