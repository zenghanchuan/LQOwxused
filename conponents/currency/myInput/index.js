// conponents/currency/myInput/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    inputInfo: {
      type: String,
      value: '手机号'
    },
    inputLength: {
      type: String,
      value: "13"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    phoneText:'',
    ifFocus:false,
    btn_disable: 'disable'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //验证手机号
    input:function(e){
      let value = e.detail.value;
      value = value.replace(/[\u4E00-\u9FA5`~!@#$%^&*()_+<>?:"{},.\/;'[\]\-\sa-zA-Z]*/g, "");
      let result = [];
      for (let i = 0; i < value.length; i++) {
        if (i == 3 || i == 7) {
          result.push(" ", value.charAt(i));
        }
        else {
          result.push(value.charAt(i));
        }
      }
      this.setData({
        phoneText: result.join("")
      })
      if (this.data.phoneText.length == 13) {
        this.setData({
          btn_disable: ''
        })
      } else {
        //如果手机号不满足规则
        this.setData({
          btn_disable: 'disable'
        })
      }
    }
  }
})
