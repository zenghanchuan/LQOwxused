import {
  config
} from '../config.js'
class HTTP {
  request(params) {
    if (!params.method) {
      params.method = "GET"
    }
    wx.request({
      url: config.api_base_url + params.url,
      method: params.method,
      data: params.data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        let code = res.statusCode.toString();
        if (code.startsWith('2')) {
          params.success(res.data);
        } else {
          wx.showToast({
            title: '错误',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '服务器错误',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
}
class Navigate {
  toSomeWhere(dress = '/pages/rentCar/rentCar') {
    wx.navigateTo({
      url: dress,
    })
  }
}
class Common {
  //显示模态窗口
  showModal(title, content, callback,ifShowCancel=true) {
    wx.showModal({
      title: title,
      content: content,
      confirmColor: '#1F4BA5',
      cancelColor: '#7F8389',
      showCancel: ifShowCancel,
      success: function(res) {
        if (res.confirm) {
          callback && callback();
        }
      }
    })
  }
}
class Promiserequest {
  wxPromise(method='GET', url, data) {
    //返回一个Promise对象
    return new Promise(function(resolve, reject) {
      wx.request({
        url: url,
        method: method,
        data: data,
        header: {
          "Content-Type": "application/json"
        },
        success: function(res) {
          //这里可以根据自己项目服务端定义的正确的返回码来进行，接口请求成功后的处理
          // if (res.data.rtnCode == "000000") {
          //   resolve(res);
          // } else {
          //   //如果出现异常则弹出dialog
          //   let common=new Common();
          //   common.showModal('提示','系统异常',null,false);
          // }
          resolve(res);
          console.log(res)
          let common = new Common();
          common.showModal('提示', '系统异常', null, false);
        },
        fail: function(res) {
          wx.showToast({
            title: '服务器暂时无法连接',
            icon: 'loading',
            duration: 2000
          })
          reject(res);
        },
        complete:function(){
          wx.hideLoading();
        }
      });
    });
  }


  getRequest(url, data) {
    return wxPromise("GET", url, data);
  }

  postRequest(url, data) {
    return wxPromise("POST", url, data);
  }
}
class CheckIncome{
  //校验提现佣金
  checkNumber(obj, that) {
    // var reg = /^([1-9]\d*|0)((\.\d{2}){1})$/;
    let reg = /^[0-9]*$/;
    //判断是否保留两位有效数字
    console.log(obj)
    if (obj != "" && !reg.test(obj)) {
      that.setData({
        Tips: '请输入整数',
        flag: true
      })
      return false;
    } else {
      var obj = parseInt(obj)
      var balance = parseInt(that.data.balance);
      if (obj > balance) {
        that.setData({
          Tips: '超出可提现金额',
          flag: true
        })
        return false;
      } else {
        if (obj < 100 || obj % 100 !== 0) {
          that.setData({
            Tips: '提现金额小于100元或不是100的整数倍',
            flag: true
          })
          return false;
        } else if (obj > 5000){122
          that.setData({
            Tips: '提现金额大于5000',
            flag: true
          })
        } else {
          if (isNaN(obj)) {
            that.setData({
              Tips: '',
              flag: true
            })
            return false;
          } else {
            that.setData({
              Tips: '输入正确',
              flag: false
            })
          }
        }
      }
    }
  }
}

class Throttle{
  throttle(fn, gapTime){
    if (gapTime == null || gapTime == undefined) {
      gapTime = 1500
    }
    let _lastTime = null

    //返回新的函数
    return function () {
      let _nowTime = + new Date()
      if (_nowTime - _lastTime > gapTime || !_lastTime) {
        fn.apply(this, arguments)   //将this和参数传给原函数
        _lastTime = _nowTime
      }
    }
  }
}

export {
  HTTP,
  Navigate,
  Common,
  Promiserequest,
  CheckIncome,
  Throttle
}