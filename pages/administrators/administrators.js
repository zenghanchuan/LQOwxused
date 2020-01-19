// pages/administrators/administrators.js
import { Throttle } from '../../utils/util.js';
var qqmap = require('../../libs/qqmap-wx-jssdk.js');
const app = getApp(); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    electric: '100', //剩余电量
    equid: '',
    operationMessage: [],
    zlcoperationMessage: [],
    time: '00:00:00',//已使用时间
    color: '',
    zlccurrent: 2,
    current_item: 3,
    timed: '无',//开锁时间
    addres: '无',  //开锁地点需其他页面传值
    addressNowlat: '',//当前开锁地址（经纬度）
    addressNowlng: '',
    latitude: '',
    longitude: '',
    cid: '',
    token: '',
    timeNow: '',
    lqoSession: '',
    flag: true,
    sign: '',
    code: '',
    orderId: '',
    orderNum: '',
    money: '',
    hiddenmodalput: true,
    mark: true,
    order: true,
    method: true,
    bikeNum:'',
    items: [
      { name: '0', value: '输入商户单号', checked: 'true' },
      { name: '1', value: '输入车辆编号' },
    ],
    // inputNum: false,
    // refundTo: [
    //   { sign: '2', value: '用户订单', checked: 'true' },
    //   { sign: '1', value: '管理员订单' },
    // ],
    array: ['用户', '管理员'],
    type: ['电动车', '助力车'],
    // objectArray: [{id: 2,name: '用户'},{id: 1,name: '管理员'}],
    // objectType: [{ id: 0, name: '电动车'}, { id: 1, name: '助力车'}],
    index: 0,
    ind:0,
    refundCode: '',
  },

  //电动车管理员页面
  change: new Throttle().throttle(function (e) {
    var str = app.globalData.valData;//获取扫码车辆信息
    console.log(str)
    let idx = e.currentTarget.dataset.index,
      that = this,
      cid = this.data.cid,
      addressNowlat = this.data.addressNowlat,
      addressNowlng = this.data.addressNowlng,
      color = this.data.color;
    this.setData({
      current_item: idx
    })
    if (idx == 2) {  //还车  管理员设防
      console.log(str.bak2.split(",")[0][8], str.bak2.split(",")[0][2])
      wx.getLocation({//获取当前换车位置经纬度
        type: 'gcj02',  //编码方式，
        success: function (res) {
          console.log(res, res.latitude, res.longitude)
          that.setData({ addressNowlat: res.latitude, addressNowlng: res.longitude })
          console.log(that.data.cid, that.data.timeNow, that.data.addressNowlat, that.data.addressNowlng, app.globalData.lqoSession)

          if (str.bak2.split(",")[0][8] == 1 && str.bak2.split(",")[0][2] == 1) {//车辆已锁且已设防
            wx.showModal({
              title: '提示',
              content: '是否还车',
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '加载中。。。',
                  })
                  wx.request({
                    url: app.globalData.baseUrl + '/order/giveBack',
                    method: 'POST',
                    data: {
                      cid: that.data.cid, lat: that.data.addressNowlat, lng: that.data.addressNowlng, lqoSession: app.globalData.lqoSession
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      console.log(res.data, app.globalData.orderInformation)
                      if (res.data.status == 100) {
                        wx.showModal({
                          title: '提示',
                          content: '该车无订单，无需还车。。。',
                        })
                      } else if (res.data.status == 102) {
                        console.log("连接成功")
                        wx.request({ //添加设防指令
                          url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                          data: {
                            "command": "S12", //设防、撤防            
                            "parameter": "0", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 3, //远程指令                
                            "remarks": "设防",
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                            // wx.showModal({
                            //   title: '提示',
                            //   content: '设防成功',
                            // })
                          },
                        })
                        wx.request({ //添加锁车指令
                          url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                          data: {
                            "command": "S15", //远程解锁、锁车            
                            "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 3, //远程指令                
                            "remarks": "锁车",
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                          },
                        })
                        wx.request({               //carstop强制关锁  避免s15确认关锁后再次扫码出现车辆正在骑行状态
                          url: 'https://api.gpslink.cn/api/Tcpcmds/PostCmdNew?cid=' + that.data.cid,
                          data: {
                            "command": "CARSTOP", //远程解锁、锁车            
                            "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 1, //远程指令                
                            "remarks": "CARSTOP",
                            "clientid": "android"
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                            wx.showModal({
                              title: '提示',
                              content: '还车成功！',
                              showCancel: false,
                              success: function (res) {
                                if (res.confirm) {
                                  console.log('关闭人工退款')
                                  that.setData({
                                    operationMessage: [{ text: '派送开锁' }, { text: '派送关锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
                                  })
                                  if (app.globalData.orderInformation.using == 'admin') {
                                    that.getOrder();
                                  }
                                }
                              }
                            })
                          },
                          fail: (res) => {
                            console.log('还车失败，请联系技术人员！')
                          }
                        })
                      }
                    },
                    complete: function(res){
                      wx.hideLoading()
                    }
                  })
                }else{
                  console.log('用户点击取消')
                }
              }
            })
          } else if (str.bak2.split(",")[0][8] == 1 && str.bak2.split(",")[0][2] == 0) {//车辆已锁车且撤防
            wx.showModal({
              title: '提示',
              content: '是否还车',
              success(res) {
                if (res.confirm) {
                  // wx.showToast({
                  //   title: '此车已被他人占用，请扫其他车',
                  //   icon: 'none',
                  //   duration: 2000,
                  // })
                  wx.showLoading({
                    title: '加载中。。。',
                  })
                  wx.request({        //还车接口
                    url: app.globalData.baseUrl + '/order/giveBack',
                    method: 'POST',
                    data: {
                      cid: that.data.cid, lat: that.data.addressNowlat, lng: that.data.addressNowlng, lqoSession: app.globalData.lqoSession
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      console.log(res.data, app.globalData.orderInformation)
                      if (res.data.status == 100) {
                        wx.showModal({
                          title: '提示',
                          content: '该车无订单，无需还车。。。',
                        })
                        that.setData({
                          order: false,
                        })
                      } else {
                        wx.request({
                          url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                          data: {
                            "command": "S12", //设防、撤防            
                            "parameter": "0", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 3, //远程指令                
                            "remarks": "设防",
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                            wx.showModal({
                              title: '提示',
                              content: '还车成功！',
                              showCancel: false,
                              success: function (res) {
                                if (res.confirm) {
                                  console.log('关闭人工退款')
                                  that.setData({
                                    operationMessage: [{ text: '派送开锁' }, { text: '派送关锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
                                  })
                                  if (app.globalData.orderInformation.using == 'admin') {
                                    that.getOrder();
                                  }
                                }
                              }
                            })
                          },
                          fail: (res) => {
                            console.log('还车失败，请联系技术人员！')
                          }
                        })
                      }
                    },
                    complete: function (res){
                      wx.hideLoading();
                    }
                  })
                } else {
                  console.log('用户点击取消')
                }
              }
            })
          } else if (str.bak2.split(",")[0][8] == 0 && str.bak2.split(",")[0][2] == 0) {//车辆已撤防且已解锁
            wx.showModal({
              title: '提示',
              content: '是否还车',
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '加载中。。。',
                  })
                  wx.request({
                    url: app.globalData.baseUrl + '/order/giveBack',
                    method: 'POST',
                    data: {
                      cid: that.data.cid, lat: that.data.addressNowlat, lng: that.data.addressNowlng, lqoSession: app.globalData.lqoSession
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      console.log(res.data, app.globalData.orderInformation)
                      if (res.data.status == 100) {
                        wx.showModal({
                          title: '提示',
                          content: '该车无订单，无需还车。。。',
                        })
                        that.setData({
                          order: false,
                        })
                      } else {
                        wx.request({
                          url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                          data: {
                            "command": "S12", //设防、撤防            
                            "parameter": "0", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 3, //远程指令                
                            "remarks": "设防",
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                            // wx.showModal({
                            //   title: '提示',
                            //   content: '设防成功',
                            // })
                          },
                        })
                        wx.request({
                          url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                          data: {
                            "command": "S15", //远程解锁、锁车            
                            "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 3, //远程指令                
                            "remarks": "锁车",
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                          },
                        })
                        wx.request({               //carstop强制关锁  避免s15确认关锁后再次扫码出现车辆正在骑行状态
                          url: 'https://api.gpslink.cn/api/Tcpcmds/PostCmdNew?cid=' + that.data.cid,
                          data: {
                            "command": "CARSTOP", //远程解锁、锁车            
                            "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 1, //远程指令                
                            "remarks": "CARSTOP",
                            "clientid": "android"
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                            wx.showModal({
                              title: '提示',
                              content: '还车成功！',
                              showCancel: false,
                              success: function (res) {
                                if (res.confirm) {
                                  console.log('关闭人工退款')
                                  that.setData({
                                    operationMessage: [{ text: '派送开锁' }, { text: '派送关锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
                                  })
                                  if (app.globalData.orderInformation.using == 'admin') {
                                    that.getOrder();
                                  }
                                }
                              }
                            })
                          },
                          fail: (res) => {
                            console.log('还车失败，请联系技术人员！')
                          }
                        })
                      }
                    },
                    complete: function(res){
                      wx.hideLoading();
                    }
                  })
                } else {
                  console.log('用户点击取消')
                }
              }
            })
          } else if (str.bak2.split(",")[0][8] == 0 && str.bak2.split(",")[0][2] == 1) {//车辆已解锁且设防
            wx.showModal({
              title: '提示',
              content: '是否还车',
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '加载中。。。',
                  })
                  console.log('用户点击确定')
                  console.log(that.data.cid, that.data.timeNow, that.data.addressNowlat, that.data.addressNowlng)
                  wx.request({
                    url: app.globalData.baseUrl + '/order/giveBack',
                    method: 'POST',
                    data: {
                      cid: that.data.cid, lat: that.data.addressNowlat, lng: that.data.addressNowlng, lqoSession: app.globalData.lqoSession
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      console.log(res.data, app.globalData.orderInformation)
                      if (res.data.status == 100) {
                        wx.showModal({
                          title: '提示',
                          content: '该车无订单，无需还车。。。',
                        })
                        that.setData({
                          order: false,
                        })
                      } else {
                        wx.request({
                          url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
                          data: {
                            "command": "S15", //远程解锁、锁车            
                            "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 3, //远程指令                
                            "remarks": "锁车",
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                          },
                        })
                        wx.request({               //carstop强制关锁  避免s15确认关锁后再次扫码出现车辆正在骑行状态
                          url: 'https://api.gpslink.cn/api/Tcpcmds/PostCmdNew?cid=' + that.data.cid,
                          data: {
                            "command": "CARSTOP", //远程解锁、锁车            
                            "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
                            "comtype": 1, //远程指令                
                            "remarks": "CARSTOP",
                            "clientid": "android"
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Authorization': that.data.token
                          },
                          method: 'POST',
                          dataType: 'json',
                          responseType: 'text',
                          success: (res) => {
                            console.log(res)
                            wx.showModal({
                              title: '提示',
                              content: '还车成功！',
                              showCancel: false,
                              success: function (res) {
                                if (res.confirm) {
                                  console.log('关闭人工退款')
                                  that.setData({
                                    operationMessage: [{ text: '派送开锁' }, { text: '派送关锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
                                  })
                                  if (app.globalData.orderInformation.using == 'admin') {
                                    that.getOrder();
                                  }
                                }
                              }
                            })
                          },
                          fail: (res) => {
                            console.log('还车失败，请联系技术人员！')
                          }
                        })
                      }
                    },
                    complete: function(res){
                      wx.hideLoading();
                    }
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })

          }
        }
      });

      
    } else if (idx == 3) {//选择赔偿
      console.log(that.data.cid)
      wx.request({
        url: app.globalData.baseUrl + '/repair/findRepair',
        method: 'GET',
        data: {
          cid: that.data.cid,
          repairProcessState: 1,
        },
        header: {
          "Content-Type": "application/json"
        },
        success: function (res) {
          console.log(app.globalData.orderInformation)
          if (app.globalData.orderInformation.status == 103) {
            wx.showModal({
              title: '提示',
              content: '该车暂无订单无需管理。',
            })
            that.setData({
              order: false
            })
          }
          else if (res.data.status == 102) { //该车无赔偿订单 可选择
            that.setData({ color: '#37aa4a' })
            console.log(that.data.orderId)
            wx.navigateTo({
              url: '/pages/compensate/compensate?sign=2&orderId=' + that.data.orderId,
            })
          }
          else if (res.data.status == 101) {
            wx.showModal({
              title: '提示',
              content: '您已选择了赔偿类型，请勿重复选择！',
            })
          }
        }
      })
    } else if (idx == 0) {
      console.log(app.globalData.orderInformation)
      if (app.globalData.orderInformation.status == 103) { //车辆无订单 判断用户是否有订单
        if (that.data.electric >= 40) { //判断电量
          wx.showModal({
            title: '提示',
            content: '管理员权限，请慎重选择，是否开锁',
            success(res) {
              if (res.confirm) {
                console.log('电动车开锁');
                console.log(that.data.isSupre)
                if (that.data.isSupre == '1'){
                  that.ddcUnlock();
                } else if (that.data.isSupre == '0'){
                  //判断管理员是否存在订单
                  wx.request({
                    url: app.globalData.baseUrl + '/order/getOrder',
                    method: 'post',
                    data: {
                      lqoSession: app.globalData.lqoSession
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      console.log(res);
                      if (res.data.status == '103') { //该用户无订单状态 可开锁
                        that.pay();
                      } else if (res.data.status == '102') {  //该用户存在订单  不可开锁
                        wx.showModal({
                          title: '提示',
                          content: '存在订单，不可开锁，\r\n请先结束订单状态!',
                        })
                      }
                    }
                  })
                }
              } else if (res.cancel) {
                console.log('管理员点击取消')
              }
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '该车电量低，请充电！！',
            showCancel: false,
          })
        }
      } else if (app.globalData.orderInformation.status == 102) { //有订单 不能开锁
        wx.showModal({
          title: '提示',
          content: '该车辆存在订单,\r\n不能开锁，请换车！',
          showCancel: false,
        })
      }
    } else if (idx == 1) {
      wx.showModal({
        title: '提示',
        content: '管理员权限，请慎重选择，是否关锁',
        success(res) {
          if (res.confirm) {
            that.ddcLock();
          } else if (res.cancel) {
            console.log('管理员点击取消')
          }
        }
      })
    } else if (idx == 4) {
      console.log("人工退款");
      console.log(app.globalData.orderInformation)
      console.log(that.data.order)
      if (app.globalData.orderInformation.status == 102) {
        console.log('该车支持人工退款');
        this.setData({
          hiddenmodalput: !this.data.hiddenmodalput,
          image: app.globalData.orderInformation.order.image,
          nickName: app.globalData.orderInformation.order.nickName,
          phone: app.globalData.orderInformation.phone,
        })
      } else {
        wx.showModal({
          title: '提示',
          // showCancel: false,
          content: '该车没有产生订单，请输入商户单号及退款金额！',
          success: function (res) {
            if (res.confirm) {
              that.setData({
                mark: !that.data.mark,
              })
            }
          }
        })
      }
    }

  }, 1000),

  //助力车管理员页面
  zlcChange: new Throttle().throttle(function (e) {
    let index = e.currentTarget.dataset.index;
    let that = this;
    that.setData({
      zlccurrent: index
    })
    if (index == 0) {
      console.log(app.globalData.orderInformation)
      if (app.globalData.orderInformation.status == 103){ //车辆无订单 判断用户是否存在订单
        if (that.data.electric >= 10) { //判断电量
          wx.showModal({
            title: '提示',
            content: '管理员权限，请慎重选择，是否开锁',
            success: function (res) {
              if (res.cancel) {
                //点击取消,默认隐藏弹框
                wx.showToast({
                  title: '取消开锁',
                  icon: 'none'
                })
              } else {
                //点击确定   判断管理员是否存在订单
                wx.showLoading({
                  title: '加载中。。。',
                })
                console.log(that.data.isSupre)
                if (that.data.isSupre == '1'){
                  wx.request({
                    url: app.globalData.baseUrl + '/bike/checkIsRiding',
                    data: {
                      code: that.data.code
                    },
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: 'POST',
                    success: function (res) {
                      console.log(res)
                      if (res.data.status == '101') {
                        wx.showLoading({
                          title: '骑行中',
                        })
                      } else if (res.data.status == '102') {
                        if (res.data.bike.repairState == "正常") {
                          // wx.showToast({
                          //   title: '开锁中',
                          //   icon: 'none',
                          // })
                          wx.showLoading({
                            title: '开锁中',
                          })
                          wx.request({
                            url: app.globalData.baseUrl + '/bike/unlock',
                            method: 'post',
                            data: {
                              cId: wx.getStorageSync('adminCid'),
                              lqoSession: app.globalData.lqoSession,
                            },
                            header: {
                              'content-type': 'application/x-www-form-urlencoded'
                            },
                            success: function (res) {
                              wx.hideLoading();
                              console.log(res);
                              let arry = JSON.parse(res.data.result);
                              console.log(arry.code)
                              wx.hideLoading()
                              if (arry.code == "success") {
                                wx.showToast({
                                  title: '开锁成功',
                                })
                                // that.managerUnlock();
                              } else if (arry.code == "unknown_identity") {
                                wx.showToast({
                                  title: '请求的锁不存在',
                                  icon: 'none',
                                })
                              } else if (arry.code == "timeout") {
                                wx.showToast({
                                  title: '等待锁响应超时',
                                  icon: 'none',
                                })
                              } else if (arry.code == "inner_error") {
                                wx.showToast({
                                  title: '内部错误',
                                  icon: 'none',
                                })
                              } else if (arry.code == "wrong_para") {
                                wx.showToast({
                                  title: '参数错误',
                                  icon: 'none',
                                })
                              } else if (arry.code == "cmd_send_fail") {
                                wx.showToast({
                                  title: '向锁发送指令失败',
                                  icon: 'none',
                                })
                              } else if (arry.unlock_way == "Fail-Unlocked") {
                                wx.showModal({
                                  title: '提示',
                                  content: '锁没关闭,查看是否卡住了',
                                  showCancel: false,
                                })
                              }
                            }
                          })
                        } else {
                          wx.showModal({
                            title: '提示',
                            content: '该车已损坏！!',
                            showCancel: false,
                          })
                        }
                      }
                    }
                  })
                } else if (that.data.isSupre == '0'){
                  wx.request({
                    url: app.globalData.baseUrl + '/order/getOrder',
                    method: 'post',
                    data: {
                      lqoSession: app.globalData.lqoSession
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      console.log(res);
                      if (res.data.status == '103') { //该用户无订单状态 可开锁
                        wx.request({
                          url: app.globalData.baseUrl + '/bike/checkIsRiding',
                          data: {
                            code: that.data.code
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded"
                          },
                          method: 'POST',
                          success: function (res) {
                            console.log(res)
                            if (res.data.status == '101') {
                              wx.showModal({
                                title: '提示',
                                content: '骑行中',
                              })
                            } else if (res.data.status == '102') {
                              if (res.data.bike.repairState == "正常") {
                                wx.showToast({
                                  title: '开锁中',
                                  icon: 'none',
                                })
                                that.pay();
                              } else {
                                wx.showModal({
                                  title: '提示',
                                  content: '该车已损坏！!',
                                  showCancel: false,
                                })
                              }
                            }
                          },
                          complete: function (res) {
                            wx.hideLoading();
                          }
                        })
                      } else if (res.data.status == '102') {  //该用户存在订单  不可开锁
                        wx.showModal({
                          title: '提示',
                          content: '存在订单，不可开锁，\r\n请先结束订单状态!',
                        })
                        wx.hideLoading()
                      }
                    }
                  })
                }
              }
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '该车锁电量低，\r\n请充电！！',
            showCancel: false,
          })
        }
      } else if (app.globalData.orderInformation.status == 102){ //有订单 不能开锁
        wx.showModal({
          title: '提示',
          content: '该车辆存在订单,\r\n不能开锁，请换车！',
          showCancel: false,
        })
      }
    } else if (index == 1) {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          console.log(res);
          // 存经纬度
          that.setData({
            addressNowlat: res.latitude,
            addressNowlng: res.longitude
          })
          wx.showModal({
            title: '提示',
            content: '请查看是否已关锁，\r\n确定还车!',
            success: function (res) {
              if (res.cancel) {
                //点击取消,默认隐藏弹框
                wx.showToast({
                  title: '取消还车',
                  icon: 'none'
                })
              } else {
                //点击确定
                wx.showLoading({
                  title: '加载中。。。',
                })
                wx.request({        //还车接口
                  url: app.globalData.baseUrl + '/order/giveBack',
                  method: 'POST',
                  data: {
                    cid: wx.getStorageSync('adminCid'),
                    lat: that.data.addressNowlat,
                    lng: that.data.addressNowlng,
                    lqoSession: app.globalData.lqoSession
                  },
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function (res) {
                    console.log(res)
                    if (res.data.status == 100) {
                      wx.showModal({
                        title: '提示',
                        content: '该车无订单，无需还车。。。',
                      })
                    } else if (res.data.status == 102) {
                      wx.showModal({
                        title: '提示',
                        content: '还车成功！',
                        showCancel: false,
                      })
                      console.log('关闭人工退款')
                      that.setData({
                        zlcoperationMessage: [{ text: '派送开锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
                      })
                      if (app.globalData.orderInformation.using == 'admin'){
                        that.getOrder();
                      }
                    }
                  },
                  complete: function(res){
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        },
        fail: function (res) {
          console.log("位置获取失败");
          wx.showModal({
            title: '提示',
            content: '位置获取失败，请线下还车！',
          })
        }
      })

    } else if (index == 2) {
      wx.request({
        url: app.globalData.baseUrl + '/repair/findRepair',
        method: 'GET',
        data: {
          cid: wx.getStorageSync('adminCid'),
          repairProcessState: 1,
        },
        header: {
          "Content-Type": "application/json"
        },
        success: function (res) {
          console.log(res)
          console.log(app.globalData.orderInformation)
          if (app.globalData.orderInformation.status == 103) {
            wx.showModal({
              title: '提示',
              content: '该车暂无订单无需管理。',
            })
            that.setData({
              order: false,
            })
          }
          else if (res.data.status == 102) { //该车无赔偿订单 可选择
            that.setData({ color: '#37aa4a' })
            wx.navigateTo({
              url: '/pages/compensate/compensate?sign=1&orderId=' + that.data.orderId,
            })
          }
          else if (res.data.status == 101) {
            wx.showModal({
              title: '提示',
              content: '您已选择了赔偿类型，请勿重复选择！',
            })
          }
        }
      })
    } else if (index == 3) {
      console.log(app.globalData.orderInformation)
      console.log(that.data.order)
      if (app.globalData.orderInformation.status == 102) {
        console.log('该车支持人工退款');
        this.setData({
          hiddenmodalput: !this.data.hiddenmodalput,
          image: app.globalData.orderInformation.order.image,
          nickName: app.globalData.orderInformation.order.nickName,
          phone: app.globalData.orderInformation.phone,
        })
      } else {
        wx.showModal({
          title: '提示',
          // showCancel: false,
          content: '该车没有产生订单，请输入商户单号及退款金额！',
          success: function (res) {
            if (res.confirm) {
              that.setData({
                mark: !that.data.mark,
              })
            }
          }
        })
      }
    }
  }, 1000),

  cancel: function () {
    let that = this;
    console.log(this.data.order)
    if (that.data.order) {
      that.setData({
        hiddenmodalput: true
      });
    } else {
      that.setData({
        mark: true
      })
    }
  },
  confirm: function () {
    console.log('确认退款')
    let that = this;
    console.log(this.data.order, that.data.sign)
    if (that.data.order) { //有订单退款
      console.log(that.data.money)
      if (that.data.money == '') {
        wx.showModal({
          title: '提示',
          content: '输入框为空，请重新输入！',
          showCancel: false,
        })
      } else {
        that.setData({
          hiddenmodalput: true
        });
        that.refund(parseInt(that.data.money), app.globalData.orderInformation.lqoSession, app.globalData.lqoSession, 2)
        that.setData({
          money: '',
        })
      }
    } else { //无订单退款
      // console.log(that.data.money)
      // console.log(that.data.bikeNum);
      // console.log(that.data.money == '' || that.data.bikeNum == '')
      if (that.data.money == '' || that.data.bikeNum == '') {
        wx.showModal({
          title: '提示',
          content: '输入框为空，请重新输入！',
          showCancel: false,
        })
      } else if (that.data.bikeNum.length != '6') {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '车辆编号长度不符!',
          success: function (res) {
            if (res.confirm) {
              that.setData({
                bikeNum: ''
              })
            }
          }
        })
      }else {
        console.log(that.data.index, that.data.bikeNum, that.data.ind, that.data.money)
        let state = '';
        if (that.data.ind == '0'){
          console.log('电动车')
          that.setData({
            refundCode: 'DDC' + that.data.bikeNum
          })
          
        }else {
          console.log('助力车')
          that.setData({
            refundCode: 'ZLC' + that.data.bikeNum
          })
        }
        if (that.data.index == '0') {
          console.log('用户')
          state = '2';
        } else {
          console.log('管理员')
          state = '1';
        }
        console.log(that.data.refundCode, state)
        that.noOrderRefund(that.data.refundCode, parseInt(that.data.money), state)
      }
    }
  },

  //选择退款方式
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },

  // 选择退款车辆类型
  bindPickerState: function (e) {
    console.log(e)
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      ind: e.detail.value
    })
  },

  // 输入车辆编号，选择退款对象
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  //记录超级管理员开锁记录
  // managerUnlock: function () {
  //   let that = this;
  //   let str = that.data.code;
  //   let code = str.substring(str.length - 6);
  //   wx.request({
  //     url: app.globalData.baseUrl + '/order/managerUnlock',
  //     method: 'POST',
  //     data: {
  //       cid: wx.getStorageSync('adminCid'),
  //       lqoSession: app.globalData.lqoSession,
  //     },
  //     header: {
  //       "Content-Type": "application/x-www-form-urlencoded"
  //     },
  //     success: function (res) {
  //       console.log(res);
  //     }
  //   })
  // },

  //查询订单状态 /order/getOrder
  getOrder: function (){
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
      success: function (res) {
        console.log(res);

        if (res.data.status == '102') {
          //用户有订单
          that.setData({
            orderId: res.data.order.orderId
          })
          let rideTime = res.data.time - 45 * 60;
          if (rideTime > 0) { //超过45分钟
            wx.showModal({
              title: '提示',
              content: '开锁时间超过45分钟，\r\n将不会退钱！',
              showCancel: false,
              success: function (res){
                if(res.confirm){
                  that.endOrder(app.globalData.lqoSession, 1);
                }
              }
            })
          } else { //未超过
            wx.showModal({
              title: '提示',
              content: '开锁时间未超过45分钟，\r\n押金退回！',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  that.refund('300', app.globalData.lqoSession, that.data.sign, 1);
                }
              }
            })
          }
        } else if (res.data.status == '103') {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '订单已结束',
          })
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  //电动车关锁
  ddcLock: function () {
    let that = this;
    wx.request({
      url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
      data: {
        "command": "S15", //远程解锁、锁车            
        "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
        "comtype": 3, //远程指令                
        "remarks": "关锁",
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Authorization': that.data.token
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
      },
    })
    wx.request({               //carstop强制关锁  避免s15确认关锁后再次扫码出现车辆正在骑行状态
      url: 'https://api.gpslink.cn/api/Tcpcmds/PostCmdNew?cid=' + that.data.cid,
      data: {
        "command": "CARSTOP", //远程解锁、锁车            
        "parameter": "1", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
        "comtype": 1, //远程指令                
        "remarks": "CARSTOP",
        "clientid": "android"
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Authorization': that.data.token
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        wx.showModal({
          title: '提示',
          content: '锁车成功',
          showCancel: false,
        })
      },
      fail: (res) => {
        console.log('还车失败，请联系技术人员！')
      }
    })
    wx.request({
      url: 'https://api.gpslink.cn/api/Tcpcmds?cid=' + that.data.cid,
      data: {
        "command": "S12", //设防、撤防            
        "parameter": "0", //远程解锁、锁车指令，参数 1表示锁车，0表示解锁
        "comtype": 3, //远程指令                
        "remarks": "设防",
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Authorization': that.data.token
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        wx.showModal({
          title: '提示',
          content: '设防成功',
          showCancel: false,
        })
        console.log('关锁完成')
        // that.setData({
        //   operationMessage: [{ text: '派送开锁' }, { text: '派送关锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
        // })
      },
    })
  },

  //电动车开锁
  ddcUnlock: function () {
    let that = this;
    wx.showLoading({
      title: '开锁中',
    })
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
            console.log(res);
            
            if(that.data.isSupre == '0'){
              console.log('发送经纬度等信息')
              //发送经纬度等信息
              wx.setStorageSync('lockTime', new Date().getTime())
              that.sendlat();
              // setTimeout(function () {
              //   that.sendlat();
              // }, 2000)

            }else {
              console.log('超级管理员开锁')
              wx.showModal({
                title: '提示',
                content: '开锁成功',
                showCancel: false,
              })
            }
          },
          complete: function (res) {
            wx.hideLoading();
          }
        })
      },
    })
  },

  formOrderNum: function (e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      orderNum: e.detail.value
    })
    if (e.detail.value == '') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '商户单号为空！请重新输入',
      })
    }
  },

  formValue: function (e) {
    console.log(e.detail.value)
    let that = this;
    that.setData({
      money: e.detail.value
    })
    if (e.detail.value > 300) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '退款金额大于300！',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              money: ''
            })
          }
        }
      })
    } else if (e.detail.value == '') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '退款金额为空！请重新输入',
      })
    }
  },

  formbikeNum: function (e) {
    console.log(e.detail.value)
    console.log(e.detail.value.length == '8')
    let that = this;
    that.setData({
      bikeNum: e.detail.value
    })
  },

  //车辆有订单 退款
  refund: function (e, lqoSession, sign, flag) {
    console.log(e, lqoSession, sign, flag)
    let that = this;
    wx.showLoading({
      title: '加载中。。。',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/refund',
      data: {
        price: e,
        lqoSession: lqoSession,
        sign: sign
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
          if (flag == 1) {
            that.endOrder(app.globalData.lqoSession, flag);
          } else {
            // console.log(app.globalData.orderInformation.lqoSession)
            that.endOrder(app.globalData.orderInformation.lqoSession, flag);
          }
        } else if (res.data.status == '101') {
          wx.showModal({
            title: '提示',
            content: '退款失败！',
            showCancel: false,
          })
        } else if (res.data.status == '100') {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '输入值错误，请重试！',
          })
        } else if (res.data.status == '103') {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '该单号已退过款！',
          })
        }
      },
      complete: function(res){
        wx.hideLoading();
      }
    })
  },

  //车辆无订单 退款
  noOrderRefund: function (code, price, state) {
    console.log(code, price, state)
    let that = this;
    wx.showLoading({
      title: '加载中。。。',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/artificialRefund',
      data: {
        price: price,
        // orderNo: orderNo,
        lqoSession: app.globalData.lqoSession,
        // bikeId: app.globalData.orderInformation.bike.bikeId
        scanCode: code,
        sign: state,
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
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '退款成功！',
          })
          that.setData({
            money: '',
            bikeNum: '',
            mark: true
          })
          that.findOrder(that.data.code)
          if (that.data.sign == '2') {
            that.ddcLock();
          }
        } else if (res.data.status == '101') {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '退款失败，请稍后重试！',
          })
        } else if (res.data.status == '103') {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '检查退款对象是否正确！',
          })
        } else if (res.data.status == '104') {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '已退款！',
          })
        } else if (res.data.status == '105') {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '网络错误，请检查网络后，\r\n再重试!',
          })
        } else if (res.data.status == '100') {
          //code错误 或传值为空
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '请检查车辆类型及编号，再重试！',
          })
        }
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  //结束订单
  endOrder: function (lqoSession, flag) {
    console.log(lqoSession, flag)
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/order/over',
      data: {
        lqoSession: lqoSession,
        // orderNo: orderNo,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102' && flag == 2) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '退款成功！',
          })
          if (that.data.sign == '2') {
            that.ddcLock();
          }
        } else {
          if(flag == '3'){
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '订单已取消！',
            })
          } else {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '订单已结束！',
            })
          }
          wx.hideLoading();
        }
        that.findOrder(that.data.code)
      }
    })
  },

  //支付
  pay: function () {
    let that = this;
    //创建订单
    wx.showLoading({
      title: '加载中...',
    })
    console.log(wx.getStorageSync('orderNo'))
    // console.log(wx.getStorageInfoSync('adminCid'))
    wx.request({
      url: app.globalData.baseUrl + '/order/returnParam',
      data: {
        num: '300',
        lqoSession: app.globalData.lqoSession,
        image: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
        cid: wx.getStorageSync('adminCid'),
        orderNo: wx.getStorageSync('orderNo'),
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
                if (that.data.sign == '1') {
                  console.log('助力车开锁')
                  wx.setStorageSync('lockTime', new Date().getTime())
                  //发送经纬度等信息
                  this.sendlat();
                } else {
                  console.log('电动车开锁');
                  that.ddcUnlock();
                }
              } else{
                that.refund('300', app.globalData.lqoSession, '2', 1);
              }
            }, fail: (res) => {
              console.log(res)
              if (res.errMsg == 'requestPayment:fail cancel'){
                //支付取消
                wx.showLoading({
                  title: '支付取消',
                })
                that.endOrder(app.globalData.lqoSession, 3);
              }else{
                that.refund('300', app.globalData.lqoSession, '2', 1);
              }
              //支付取消或失败
              wx.hideLoading()
            },
          })
        } else if (res.data.status == '103') {
          wx.showModal({
            title: '提示',
            content: '订单已创建，请勿重复点击！',
            showCancel: false,
          })
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  //发送经纬度等信息
  sendlat: function () {
    let that = this;
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
        cid: wx.getStorageSync('adminCid'),
        sign: that.data.sign,
        tcId: 0,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (res.data.status == '102') {
          console.log(this.data.sign)
          wx.showModal({
            title: '提示',
            content: '开锁成功！',
            showCancel: false,
          })
          that.setData({
            orderId: res.data.orderId
          })
          that.findOrder(that.data.code)
        } else if (res.data.status == '101') {
          console.log("开锁失败")
          wx.showModal({
            title: '错误',
            content: '开锁失败,将退款',
            showCancel: false,
          })
          console.log(7878)
          that.refund('300', app.globalData.lqoSession, that.data.sign, 1);
        }
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '订单产生异常，请重新开锁，\r\n押金退回！',
          success: function () {
            that.refund('300', app.globalData.lqoSession, that.data.sign, 2);
          }
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    that.setData({
      sign: options.sign,
      code: options.code,
      orderId: options.orderId,
      isSupre: options.isSupre,
    })
    let sign = options.sign
    if (sign == '1') {
      that.setData({
        flag: false,
      })
    } else {
      that.setData({
        flag: true,
      })
    }
    console.log(app.globalData.orderInformation)//判断该车是否有订单需管理
    if (app.globalData.orderInformation.status == 103) {//103代表无订单
      wx.showModal({
        title: '提示',
        content: '该车暂无订单需管理。。。',
      })
      that.setData({
        order: false,
      })
      wx.setStorage({
        key: 'orderNo',
        data: app.globalData.orderInformation.orderNo,
      })
    }
    else if (app.globalData.orderInformation.status == 102) {//102代表该车有订单需管理
      if (app.globalData.orderInformation.using == 'user'){
        this.setData({//车辆当前订单信息,经纬度，开锁时间
          latitude: (app.globalData.orderInformation.order.orderStartAdd).substring(0, 9),
          longitude: (app.globalData.orderInformation.order.orderStartAdd).substring(10, 20),
          timed: (app.globalData.orderInformation.order.orderStartTime).substring(11, 19),
          addres: app.globalData.orderInformation.bike.regionStart
        })
      } else {
        this.setData({//车辆当前订单信息,经纬度，开锁时间
          timed: (app.globalData.orderInformation.order.orderStartTime).substring(11, 19),
          addres: app.globalData.orderInformation.bike.regionStart
        })
      }
    }
    if (options.sign == '2') {
      var str = app.globalData.valData; //扫描结果车辆信息
      var str1 = options.code;
      this.setData({
        electric: (str.bak2.split(",")[5]).substring(0, 4),
        equid: "DDC" + str1.substring(str1.length - 6),
      })
      console.log(str.bak2.split(",")[0][8], this.data.timed)
      if (str.bak2.split(",")[0][8]) {//判断车辆是否解锁状态，是则用当前时间-开锁时间加计时器
        //获取时间
        that.setTime();
        console.log('判断')
      }
      else if (str.bak2.split(",")[0][8] == 1) {
        console.log('进入')
        that.setData({ time: '00:00:00' })
      }

      wx.getStorage({
        key: 'cid',    //这个是刚才在缓存数据时的关键字，保持一致
        success: function (r) {   //成功后回调的函数，先打印出来
          that.setData({       //这个地方我等下要详细讲解，毕竟栽了两次坑了，这是第二次
            cid: r.data
          })
        },
        fail: function () {      //失败后回调的函数
          console.log('读取cid发生错误')
        }
      })
      wx.getStorage({
        key: 'first-token',    //这个是刚才在缓存数据时的关键字，保持一致
        success: function (s) {   //成功后回调的函数，先打印出来
          that.setData({       //这个地方我等下要详细讲解，毕竟栽了两次坑了，这是第二次
            token: s.data
          })
        },
        fail: function () {      //失败后回调的函数
          console.log('读取token发生错误')
        }
      })
    } else if (options.sign == '1') {
      let str1 = options.code;
      let zlcData = app.globalData.orderInformation;
      console.log(zlcData.result.bool);
      if (zlcData.result.bool) {
        let electric = JSON.parse(zlcData.result.result).power
        this.setData({
          equid: "ZLC" + str1.substring(str1.length - 6),
          electric: electric,
        })
      } else {
        console.log('当前电量获取失败');
        wx.showModal({
          title: '提示',
          content: '该车暂无数据，请换车！',
          showCancel: false,
        })
      }
      this.setData({
        equid: "ZLC" + str1.substring(str1.length - 6),
      })
      //获取时间
      that.setTime();
    }
    if (options.isSupre == '1' && options.mark != 'true') {
      console.log('超级管理员')
      that.setData({
        operationMessage: [{ text: '派送开锁' }, { text: '派送关锁' }, { text: '确认还车' }, { text: '选择赔偿' }, { text: '人工退款' }],
        zlcoperationMessage: [{ text: '派送开锁' }, { text: '确认还车' }, { text: '选择赔偿' }, { text: '人工退款' }],
      })
    } else {
      console.log('管理员')
      that.setData({
        operationMessage: [{ text: '派送开锁' }, { text: '派送关锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
        zlcoperationMessage: [{ text: '派送开锁' }, { text: '确认还车' }, { text: '选择赔偿' }],
      })
    }

  },

  //查询车辆订单 赋值给app.globalData.orderInformation
  findOrder: function (e) {
    console.log('查询订单')
    let that = this;
    wx.request({//查询该车辆是否有订单
      url: app.globalData.baseUrl + '/order/getOrderByBike',
      method: 'post',
      data: {
        code: e,
        lqoSession: app.globalData.lqoSession,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        app.globalData.orderInformation = res.data;
        if (res.data.status == 103) {//103代表无订单
          that.setData({
            addres: '无',
            timed: '无',
            order: false,
          })
          wx.setStorage({
            key: 'orderNo',
            data: app.globalData.orderInformation.orderNo,
          })
        }
        else if (res.data.status == 102) {//102代表该车有订单需管理
          that.setData({//车辆当前订单信息,经纬度，开锁时间
            timed: (res.data.order.orderStartTime).substring(11, 19),
            addres: res.data.bike.regionStart,
            order: true,
          })
        }
      }
    })
  },

  //获取时间
  setTime: function () {
    let that = this;
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000
    var n = timestamp * 1000;
    var date = new Date(n); //年  
    var Y = date.getFullYear(); //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1); //日  
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); //时  
    var h = date.getHours(); //分  
    var m = date.getMinutes(); //秒  
    var s = date.getSeconds();
    var count = 0;
    setInterval(function () {//计时器 动态
      s = s + 1
      if (s == 60) {
        s = 0, m = m + 1
        if (m == 60) {
          m = 0, h = h + 1
        }
      }
      var pastTime = h + ":" + m + ":" + s;
      var nowTime = Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;//当前时间
      that.setData({ time: pastTime, timeNow: nowTime })
    }, 1000);
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