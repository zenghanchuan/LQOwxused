// conponents/rentCar/mapCoverButton/index.js
import { Common, Throttle } from '../../../utils/util.js';
const app = getApp();
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
    code: '',
    cid: '',
    token: '',
    id: '',
    bikeState: '',
    lockState: '',
    defenseState: '',
    lat: '',
    lng: '',
    cretattime: '',
    electricQuantity: '',
    disabled:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //扫码
    scanCode: new Throttle().throttle(function () {
      var that = this;
      console.log(app.globalData.lqoSession)
      let hours = new Date().getHours();
      console.log(hours)
      if (app.globalData.loginStatus) {
        console.log('状态为' + app.globalData.loginStatus + ',未登录状态')
        let myEventDetail = true;
        that.triggerEvent('onCheck', myEventDetail);
      } else {
        console.log('状态为' + app.globalData.loginStatus + ',登录状态')
        if (!app.globalData.falge){
          console.log('用户未授权')
          let myEventDetail = true;
          that.triggerEvent('onCheck', myEventDetail);
        }else {
          console.log("扫码")
          let myEventDetail = false;
          that.triggerEvent('onCheck', myEventDetail);
          that.setData({
            disabled: true
          })
          if(hours < 21 && hours >= 7) {
            let that = this;
            wx.showLoading({
              title: '加载中',
            })
            //用户无订单
            const common = new Common();
            wx.scanCode({
              success: (res) => {
                console.log(res);
                console.log(res.result);
                console.log(res.result.length);
                if (res.result.length === 37) {
                  //助力车扫码
                  that.setData({
                    code: res.result,
                  })
                  console.log(that.data.code);

                  let zlcCode = that.data.code.slice(31, 37);
                  console.log(zlcCode);
                  console.log(res.result.slice(19))
                  that.setData({
                    code: res.result.slice(19),
                    zlcCode: zlcCode
                  })
                  // 判断车辆是否存在订单
                  that.findOrder(1)
                }

                //电动车扫码
                else if (res.result.length == 41) {
                  console.log(res.result.slice(24))
                  var ddcCode = res.result.substring(res.result.length - 6);
                  console.log(ddcCode)
                  that.setData({
                    code: res.result.slice(24),
                    ddcCode: ddcCode
                  })
                  console.log(that.data.code);
                  console.log(res.result.slice(24, 28))
                  if (res.result.slice(24, 28) == 'code') {
                    that.findOrder(2)
                  }
                }
                //电动车旧二维码
                else if (res.result.length == 17) {
                  var ddcCode = res.result.substring(res.result.length - 6);
                  console.log(ddcCode)
                  that.setData({
                    code: res.result,
                    ddcCode: ddcCode
                  })
                  console.log(that.data.code);
                  console.log(res.result.slice(0, 4));
                  if (res.result.slice(0, 4) == 'code') {
                    that.findOrder(2)
                  }
                }
                else {
                  that.setData({
                    disabled: false
                  })
                  wx.showToast({
                    title: '二维码错误！',
                    icon: 'none'
                  })
                }
                // that.triggerEvent('onCheck', res); //组件向页面传值
              },
              fail: function (res) {
                that.setData({
                  disabled: false
                })
                common.showModal('扫描二维码', "扫描失败，请重试", false);
              },
              complete: function(res) {
                wx.hideLoading()
              }
            })

          } else if (hours >= 21 || hours < 4) {
            wx.showToast({
              title: '已过营业时间！',
              icon: 'none'
            })
          }
        }
      }
    }, 2000),

    //查询车辆是否存在订单
    findOrder: function (sign) {
      let that = this;
      console.log(that.data.code)
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: app.globalData.baseUrl + '/order/getOrderByBike',
        method: 'post',
        data: {
          code: that.data.code,
          lqoSession: app.globalData.lqoSession,
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res)
          if (res.data.status == '101') {
            wx.showModal({
              title: '提示',
              content: '后台没有当前车辆，\r\n请换车！',
              showCancel: false,
            })
            that.setData({
              disabled: false
            })
          } else if (res.data.status == '103') {
            console.log('该车辆暂无订单，可继续！')
            wx.setStorage({
              key: 'orderNo',
              data: res.data.orderNo,
            })
            console.log(sign)
            if(sign == '1'){
              console.log('助力车选套餐');
              that.unlockZlc(res.data)
            } else {
              console.log('电动车选套餐')
              that.unlockDdc();
            }
          } else if (res.data.status == '102') {
            wx.showModal({
              title: '提示',
              content: '该车存在订单，\r\n请换车！',
              showCancel: false,
            })
          }
        },
        complete: function(res) {
          wx.hideLoading();
        }
      })
    },

    //助力车选套餐
    unlockZlc: function (bikeInfo){
      let that = this;
      that.setData({
        cid: bikeInfo.bike.cid
      })
      console.log(bikeInfo.result.bool);
      // let power = JSON.parse(bikeInfo.result.result).power;
      // console.log(that.data.cid, power )
      if (bikeInfo.bike.repairState == "正常") {
        if(bikeInfo.result.bool) {
          let power = JSON.parse(bikeInfo.result.result).power;
          console.log(that.data.cid, power)
          if (power >= 10) {
            //存储cid到
            wx.setStorage({
              key: 'cid',
              data: that.data.cid,
            })
            wx.navigateTo({
              //传入助力车的标识给选择套餐页面
              url: '/pages/check/check?&sign=1&equid=' + that.data.zlcCode + '&code=ZLC' + that.data.zlcCode,
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '该车锁电量低，请重新扫描车辆！！',
              showCancel: false,
            })
          }
        } else {
          console.log('电量获取失败')
          wx.showModal({
            title: '提示',
            content: '该车暂无数据，请换车！',
            showCancel: false,
          })
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '该车已损坏！!',
          showCancel: false,
        })
      }
      that.setData({
        disabled: false
      })
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          console.log(res);
          // 存经纬度
          wx.setStorage({
            key: 'lat',
            data: res.latitude,
          })
          wx.setStorage({
            key: 'lng',
            data: res.longitude,
          })
        },
        fail: function (res) {
          console.log("位置获取失败");
        }
      })


      // wx.request({
      //   url: app.globalData.baseUrl + '/bike/checkIsRiding',
      //   data: {
      //     code:that.data.code,
      //   },
      //   header: {
      //     "Content-Type": "application/x-www-form-urlencoded"
      //   },
      //   method: 'POST',
      //   success: function (res) {
      //     console.log(res)
      //     let power = JSON.parse(res.data.result.result).power;
      //     if (res.data.status == '101') {
      //       that.setData({
      //         disabled: false
      //       })
      //       wx.showToast({
      //         title: '骑行中',
      //         icon: 'none'
      //       })
      //     }
      //     else if (res.data.status == '102') {
      //       that.setData({
      //         cid: res.data.bike.cid
      //       })
      //       if (res.data.bike.repairState == "正常") {
      //         if (power >= 10) {
      //           //存储cid到
      //           wx.setStorage({
      //             key: 'cid',
      //             data: that.data.cid,
      //           })
      //           wx.navigateTo({
      //             //传入助力车的标识给选择套餐页面
      //             url: '/pages/check/check?&sign=1&equid=' + that.data.zlcCode + '&code=ZLC' + that.data.zlcCode,
      //           })
      //         } else {
      //           wx.showModal({
      //             title: '提示',
      //             content: '该车锁电量低，请重新扫描车辆！！',
      //             showCancel: false,
      //           })
      //         }

      //       } else {
      //         that.setData({
      //           disabled: false
      //         })
      //         wx.showModal({
      //           title: '提示',
      //           content: '该车已损坏！!',
      //           showCancel: false,
      //         })
      //       }
      //     }
      //     that.setData({
      //       disabled: false
      //     })
      //     wx.getLocation({
      //       type: 'wgs84',
      //       success: function (res) {
      //         console.log(res);
      //         // 存经纬度
      //         wx.setStorage({
      //           key: 'lat',
      //           data: res.latitude,
      //         })
      //         wx.setStorage({
      //           key: 'lng',
      //           data: res.longitude,
      //         })
      //       },
      //       fail: function (res) {
      //         console.log("位置获取失败");
      //       }
      //     })
      //   }
      // })
    },

    //电动车选套餐
    unlockDdc: function(){
      let that = this;
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.globalData.baseUrl + '/bike/getCid',
        data: {
          code: that.data.code
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: (res) => {
          console.log(res)
          if(res.data.status == 102){
            that.setData({
              cid: res.data.bike.cid,
            })
            //存储cid到
            wx.setStorage({
              key: 'cid',
              data: that.data.cid,
            })
            //判断是否维修状态
            if (res.data.bike.repairState == '正常') {
              console.log("可扫码");
              // 获取token
              wx.request({
                url: 'https://api.gpslink.cn/Token',
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                dataType: 'json',
                data: {
                  username: that.data.cid,
                  password: "123456",
                  grant_type: "password",
                  scope: "single"
                },
                success: (res) => {
                  console.log(res)
                  if (res.statusCode == 200) {
                    that.setData({
                      token: 'bearer ' + res.data.access_token
                    })
                    //存储第一次获取的token
                    wx.setStorage({
                      key: 'first-token',
                      data: that.data.token,
                    })

                    //获取设备所有信息
                    wx.request({
                      url: 'https://api.gpslink.cn/api/Point/Last?cid=' + that.data.cid,
                      method: "GET",
                      header: {
                        'content-type': 'application/json',
                        'Authorization': that.data.token
                      },
                      success: (res) => {
                        console.log(res)
                        that.setData({
                          bikeState: res.data.bak2.split(",")[0][1],
                          lockState: res.data.bak2.split(",")[0][8],
                          defenseState: res.data.bak2.split(",")[0][2],
                          lat: res.data.lat,
                          lng: res.data.lng,
                          cretattime: res.data.cretattime.replace(/T/g, " "),
                          electricQuantity: res.data.bak2.split(",")[5],
                        })
                        wx.setStorage({
                          key: 'lat',
                          data: res.data.lat,
                        })
                        wx.setStorage({
                          key: 'lng',
                          data: res.data.lng,
                        })
                        console.log(res.data.bak2.split(",")[0])
                        console.log("车的运动状态：" + res.data.bak2.split(",")[0][1])
                        console.log("车锁的状态：" + res.data.bak2.split(",")[0][8])
                        console.log("状态：" + res.data.bak2.split(",")[0][2])
                        console.log('剩余电量：' + res.data.bak2.split(",")[5])
                        //车是运动状态时
                        console.log(that.data.bikeState);
                        console.log(that.data.lockState)
                        if (that.data.bikeState == 1) {
                          that.setData({
                            disabled: false
                          })
                          wx.showToast({
                            title: '此车正在骑行中，请换车扫码',
                            icon: 'none',
                            duration: 2000,
                            mask: true,
                            success: function (res) { },
                          })

                        }
                        //车是静止状态时
                        if (that.data.bikeState == 0) {
                          //锁是开启状态
                          if (that.data.lockState == 0) {
                            console.log("开启状态")
                            that.setData({
                              disabled: false
                            })
                            wx.showToast({
                              title: '此车已在骑行中，请勿重复开锁',
                              icon: 'none',
                              duration: 2000,
                              mask: true,
                              success: function (res) { },
                            })
                          }
                          //锁是关闭状态且是设防状态
                          if (that.data.lockState == 1 && that.data.defenseState == 1) {
                            if (that.data.electricQuantity >= 40) {
                              console.log("关闭状态")
                              wx.navigateTo({
                                url: '/pages/check/check?equid=' + res.data.equid + '&electricQuantity=' + that.data.electricQuantity + '' + '&sign=2&code=DDC' + that.data.ddcCode, //需要传车辆信息
                              })
                            } else {
                              wx.showModal({
                                title: '提示',
                                content: '该车电量低，请重新选择车辆！！',
                                showCancel: false,
                              })
                            }
                            wx.hideLoading()
                            that.setData({
                              disabled: false
                            })
                          }
                          //锁是关闭状态且未设防
                          if (that.data.lockState == 1 && that.data.defenseState == 0) {
                            that.setData({
                              disabled: false
                            })
                            wx.showToast({
                              title: '此车已被他人占用，请扫其他车',
                              icon: 'none',
                              duration: 2000,
                            })
                          }
                        }
                      }
                    })
                  } else {
                    wx.hideLoading()
                    that.setData({
                      disabled: false
                    })
                    wx.showModal({
                      title: '失败',
                      content: '第三方连接失败，请重新选择车辆！',
                    })
                  }

                },
              })
            } else {
              that.setData({
                disabled: false
              })
              wx.showToast({
                title: '该车已损坏！!',
                icon: 'none'
              })
            }
          }else{
            that.setData({
              disabled: false
            })
            wx.showModal({
              title: '提示',
              content: '暂无该车信息，请联系管理员！！',
              showCancel: false,
            })
            wx.hideLoading();
          }
        },
      })
    }


  }
})