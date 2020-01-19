// conponents/riding/bikeInfo/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cid: {
      type: String,
      value: 'no.1'
    },
    // Battery: {
    //   type: Number,
    //   value: 10
    // },
    time: {
      type: String,
      value: '00:00:00'
    },
    rideCost: {
      type: Number,
      value: 30
    },
    phone: {
      type: String,
      value: ''
    },
    defaultCode: {
      type: String,
      value: '',
    },
    defaultStatus: {
      type: String,
      value: '',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    cid: '',
    time: '',
    setInter: '',//计时器
    tcDanjia:'',
    tcShouciSj:'',
    flag: true,
  },
  attached() {
    var that = this;
    this.setData({
      cid: wx.getStorageSync('cid'),
      tcDanjia: wx.getStorageSync('tcDanjia'),
      tcShouciSj: wx.getStorageSync('tcShouciSj'),
    })

    let lockTime = wx.getStorageSync('lockTime');
    console.log(lockTime);
    let t = new Date()
    let nowTime = t.getTime();
    let time = Math.round((nowTime - lockTime) / 1000);
    console.log(lockTime,nowTime,time)
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function () {
        var t = 0;
        if (time > -1) {
          var hour = Math.floor(time / 3600);
          var min = Math.floor(time / 60) % 60;
          var sec = time % 60;
          if (hour < 10) {
            t = '0' + hour + ":";
          } else {
            t = hour + ":";
          }

          if (min < 10) { t += "0"; }
          t += min + ":";
          if (sec < 10) { t += "0"; }
          t += sec.toFixed(0);
        }
        that.setData({ time: t })
        time += 1
      }
      , 1000);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    endSetInter: function () {
      var that = this;
      //清除计时器  即清除setInter
      clearInterval(that.data.setInter)
    },
  },
  detached(){
    var that = this;
    //清除计时器  即清除setInter
    clearInterval(that.data.setInter)
  },
  ready() {
    let that = this;
    let status = that.data.defaultStatus;
    if (status == '1'){
      console.log('管理员')
      that.setData({
        flag: false,
      })
    }else {
      console.log('用户')
    }
  }
})