//重新定位,并调节缩放
function toReset(that) {
  var promise = new Promise(function(resolve){
    that.mapCtx.moveToLocation();
    resolve('调回缩放比')
  })
  promise.then(function(value){
    setTimeout(function(){
      that.setData({
        scale: 18
      })
    }, 1000)
  })
}
//获取当前位置
function getPostion(that) {
  wx.showLoading({
    title: '定位中',
    mask: true
  })
  wx.getLocation({
    type: 'gcj02',
    altitude: true,
    success: (res) => {
      let latitude = res.latitude;
      let longitude = res.longitude;
      that.setData({
        latitude,
        longitude
      })
    },
    fail: () => {
      wx.showToast({
        title: '定位失败',
        icon: "none"
      })
    },
    complete: () => {
      wx.hideLoading();
    }
  })
}
//时间戳转化为日期格式
function timestampToTime(timestamp) {
  var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  return Y + M + D + h + m + s;
}
export default { toReset, getPostion,timestampToTime}