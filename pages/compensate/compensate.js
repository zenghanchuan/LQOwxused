// pages/retCar/rentCar.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money:'',
    flag:false,
    checkValue:null,
    val:'',//其他赔偿金额
    content:'',//其他赔偿详情描述
    cId:'',
    lng:'',
    lat:'',
    repairTime:'',
    arr:[],
    checkboxArr: [{
      id:0,//33
      name: '电池',
      text:'电池损坏',
      checked: false,
      price: '4500', 
    }, {
        id: 1,//32
        name: '电机',
        text:'电机损坏',
        checked: false,
        price: '680',
    }, {
        id: 2,//37
        name: '车架',
        text: '车架损坏',
        checked: false,
        price: '520',
    }, {
        id: 3,//29
        name: '轮毂',
        text: '车毂损坏',
        checked: false,
        price: '120',
    }, {
        id: '4',//28
        name: '车胎',
        text: '车胎损坏',
        checked: false,
        price: '450',
    }, {
        id: 5,//12
        name: '前围',
        text: '前围损坏',
        checked: false,
        price: '120',
    },
      {
        id: 6,//15
        name: '后围',
        text: '后围损坏',
        checked: false,
        price: '140',
      },
      {
        id: 7,//8
        name: '其他',
        text: '其他损坏',
        checked: false,
        price: '0',
      }],
    checkboxArry: [{
      id: 0,
      name: '其他',
      text: '其他损坏',
      checked: false,
      price: '0',
    }],
    sign: '',
    judge: true,
    orderId: '',
  },
  // 选择赔偿
  checkbox: function (e) {
    let that = this,
        flag = this.data.flag,
        arr = this.data.arr;
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    console.log(index)

    if(that.data.sign == 2){
      var checkboxArr = this.data.checkboxArr;//选项集合
      if (index == 7) {
        this.setData({ flag: !flag })
      }
      checkboxArr[index].checked = !checkboxArr[index].checked;//改变当前选中的checked值
      this.setData({
        checkboxArr: checkboxArr
      });
    }
    else if(that.data.sign == 1){
      var checkboxArry = that.data.checkboxArry;//选项集合
      that.setData({ flag: !flag })
      checkboxArry[index].checked = !checkboxArry[index].checked;//改变当前选中的checked值
      that.setData({
        checkboxArry: checkboxArry
      });
    }
  },

  checkboxChange: function (e) {//多选损坏类型存入数组checkValue中
    let checkValue = this.data.checkValue,
        that = this;
    checkValue = e.detail.value;
    this.setData({
      checkValue: checkValue
    });
    console.log(checkValue)
  },
  handel:function(e){
    console.log(e.detail.value)
    let val = this.data.val,
        that = this;
    this.setData({ val: e.detail.value })
  },
  changeContent:function(e){
    console.log(e.detail.value)
    let content = this.data.content,
        that = this;
    this.setData({ content: e.detail.value })
  },
  //等待接口获取赔偿金额
  submit:function(){
    let that = this,
        money = this.data.money,
        val = this.data.val,
        cid = this.data.cid,
        content = this.data.content,
        checkboxArr = this.data.checkboxArr,
        checkboxArry = this.data.checkboxArry,
        lat = this.data.lat,
        lng = this.data.lng,
        arr = this.data.arr,
        repairTime = this.data.repairTime,
        checkValue = this.data.checkValue;
    
    console.log(val, content, checkValue);

    if (that.data.sign == 2){
      checkboxArr.forEach(function (item) {
        if (item.checked == true) {
          console.log(item)
          arr.push(item.text)
        }
      })
    }else{
      checkboxArry.forEach(function (item) {
        if (item.checked == true) {
          console.log(item)
          arr.push(item.text)
        }
      })
    }
    
    console.log(arr);
    var sum = 0;
    for (let i = 0; i < checkValue.length; i++) {
      sum = sum + parseInt(checkValue[i]);
      console.log(sum)
      if (checkValue[i] =='0') {
        sum = sum + parseInt(this.data.val);
       }
       else{
        sum = sum + 0;
       }
    }
    // sum = sum + parseInt(this.data.val);
    console.log(sum,this.data.content)
    this.setData({money:sum})
    var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
    var n = timestamp * 1000;
    var date = new Date(n);
    var Y = date.getFullYear(); //年
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1); //月
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); //日
    var h = date.getHours(); //时
    var m = date.getMinutes(); //分
    var s = date.getSeconds(); //秒
    var time = Y + "-" + M + "-" + D + " "+ h + ":" + m + ":" + s;
    that.setData({ repairTime: time})
    console.log(that.data.money, that.data.content, that.data.repairTime, that.data.lat, that.data.lng, that.data.arr.toString())
    wx.request({
      url: app.globalData.baseUrl + '/repair/addRepair',
      method: 'GET',
      data: { 
        lqoSession: app.globalData.lqoSession, 
        cId: that.data.cId, 
        price: that.data.money, 
        other: that.data.content, 
        repairTime: that.data.repairTime, 
        repairAdd: (that.data.lat, that.data.lng), 
        repairProcessState: 1, 
        repairType: that.data.arr.toString(),
        orderId: that.data.orderId,
      },
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        if (res.data.status == '102'){
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.showToast({
            title: '失败,请重试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: '网络错误',
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this,cId = this.data.cId,
        lng = this.data.lng,
        lat = this.data.lat;
    console.log(app.globalData.valData);
    console.log(app.globalData.lqoSession);
    that.setData({
      sign: options.sign,
      orderId: options.orderId,
    })

    if(options.sign == 1){
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          console.log(res);
          // 存经纬度
          that.setData({
            lat: res.latitude,
            lng: res.longitude
          })
        },
        fail: function (res) {
          console.log("位置获取失败");
        }
      })
      that.setData({
        judge: false
      })
    } else if (options.sign == 2){
      that.setData({
        judge: true,
        lat: app.globalData.valData.lat, 
        lng: app.globalData.valData.lng,
      })
    }
    wx.getStorage({
      key: 'adminCid',    //这个是刚才在缓存数据时的关键字，保持一致
      success: function (r) {   //成功后回调的函数，先打印出来
        console.log(r.data);
        that.setData({       //这个地方我等下要详细讲解，毕竟栽了两次坑了，这是第二次
          cId: r.data
        })
        console.log(that.data.cId)
      },
      fail: function () {      //失败后回调的函数
        console.log('读取cId发生错误')
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**sc
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