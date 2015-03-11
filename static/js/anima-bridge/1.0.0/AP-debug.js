define("anima-bridge/1.0.0/AP-debug", [], function(require, exports, module) {
  var Ali = {};
  /**
   * @name ua
   * @description 同集团统一UA规范
   * @memberOf Ali
   * @readonly
   * @type {string}
   */
  Ali.ua = navigator.userAgent;
  /**
   * @name isAlipay
   * @description 是否在支付宝钱包内运行
   * @memberOf Ali
   * @readonly
   * @type {string}
   */
  Ali.isAlipay = Ali.ua.indexOf("AlipayClient") > -1;
  /**
   * @name alipayVersion
   * @description 支付宝钱包版本号
   * @memberOf Ali
   * @readonly
   * @type {string}
   */
  Ali.alipayVersion = (function() {
    if (Ali.isAlipay) {
      return Ali.ua.match(/AlipayClient\/(.*)/)[1];
    }
  })();
  /**
   * @name appinfo
   * @description 同集团统一的应用信息标识，用于判断应用及版本
   * @property {string} engine 应用所使用的 Hybrid 容器名
   * @property {string} engineVer 应用所使用的 Hybrid 容器版本号
   * @property {string} name 应用名
   * @property {string} ver 应用版本号
   * @memberOf Ali
   * @readonly
   * @type {Object}
   */
  Ali.appinfo = {
    engine: "alipay",
    engineVer: Ali.alipayVersion,
    name: "alipay",
    ver: Ali.alipayVersion
  };
  /**
   * 通用接口，调用方式等同AlipayJSBridge.call;
   * 无需考虑接口的执行上下文，必定调用成功
   * @memberOf Ali
   */
  Ali.call = function() {
    var args = [].slice.call(arguments);
    if (typeof args[args.length - 1] === "function") {
      var callback = args[args.length - 1];
      args[args.length - 1] = function(result) {
        // watchShake 的回调里没有 result，因此需要手动添加
        var result = result ? result : {};
        result.errorCode = result.error ? +result.error : 0;
        result.errorMessage = result.errorCode == 0 ? "调用成功" : result.errorMessage;
        checkError(result, args[0]);
        callback(result);
      };
    }
    var fn = function() {
      window.AlipayJSBridge.call.apply(null, args);
    };
    window.AlipayJSBridge ? fn() : Ali.on("AlipayJSBridgeReady", fn);
  };
  Ali.ready = function(fn) {
    Ali.on("AlipayJSBridgeReady", fn);
  };
  /**
   * 弱提示
   * @param {(string|object)} opt 调用参数，可为对象或字符串（为显示内容）
   * @param {string} opt.text 文字内容
   * @param {string} opt.type  icon类型，分为 none / success / fail；默认为 none；暂时不支持该参数
   * @param {number} opt.duration 显示时长，单位为毫秒，默认为 2000；暂时不支持该参数
   * @param {function} opt.onShow 暂时不支持该参数
   * @param {function} opt.onHide 暂时不支持该参数
   * @param {function} fn 回调函数
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @todo 目前不支持 onShow，onHide
   * @example // 调用参数为对象
   * Ali.toast({
   *     text: "test toast",
   *     type: "success"
   * }, function() {
   *     alert("end toast");
   * });
   * @example // 调用参数为字符串
   * Ali.toast("test toast", function() {
   *     alert("end toast");
   * });
   */
  // var def = {
  //     text: "",
  //     type: "none",
  //     duration: 2000,
  //     onShow: null,
  //     onHide: null
  // };
  Ali.toast = function(opt, fn) {
    var def = {
      text: ""
    };
    if (isStr(opt)) {
      opt = {
        text: opt
      };
    }
    simpleExtend(def, opt);
    def.content = def.text;
    Ali.call("toast", def, fn);
  };
  /**
   * 设置标题
   * @param {string|object} opt 调用参数，可为对象或字符串
   * @param {string} opt.text 文案
   * @param {string} opt.type title|subtitle
   * @param {string} opt.subtitle 副标题（仅在支付宝使用）
   * @param {function} fn 回调函数
   * @memberOf Ali
   * @example
   * Ali.setTitle({
   *     text: "title",
   *     type: "title"
   * }, function() {
   *     alert("end setTitle");
   * });
   */
  Ali.setTitle = function(opt, fn) {
    var def = {
      type: "title"
    };
    if (isStr(opt)) {
      opt = {
        text: opt
      };
    }
    simpleExtend(def, opt);
    if (def.text == null) {
      console.error("setTitle: text 参数必填！");
    } else {
      def.title = def.text;
    }
    Ali.call("setTitle", def);
    fn && fn();
  };
  /**
   * 显示标题栏
   * @param {function} fn 回调函数
   * @memberOf Ali
   * @example
   * Ali.showTitle(function() {
   *     alert("end showTitle");
   * });
   */
  Ali.showTitle = function(fn) {
    Ali.call("showTitlebar");
    fn({});
  };
  /**
   * 隐藏标题栏
   * @param  {function} fn 回调函数
   * @memberOf Ali
   * @example
   * Ali.hideTitle(function() {
   *     alert("end hideTitle");
   * });
   */
  Ali.hideTitle = function(fn) {
    Ali.call("hideTitlebar");
    fn({});
  };
  /**
   * 显示loading
   * @param {string|object} opt 调用参数，可为对象或字符串
   * @param {string} opt.text 文本内容；若不指定，则显示为中间大菊花；如果指定，显示为小菊花右侧带文字
   * @param {function} fn 回调函数
   * @memberOf Ali
   * @example
   * Ali.showLoading({
   *     text: "loading"
   * }, function() {
   *     alert("end showLoading");
   * });
   */
  // var def = {
  //     text: "",
  //     delay: 0
  // };
  Ali.showLoading = function(opt, fn) {
    var def = {};
    if (isStr(opt)) {
      opt = {
        text: opt
      };
    }
    simpleExtend(def, opt);
    Ali.call("showLoading", opt);
    fn && fn({});
  };
  /**
   * 隐藏loading
   * @param {function} fn 回调函数
   * @memberOf Ali
   * @example
   * Ali.hideLoading(function() {
   *     alert("end hideLoading");
   * });
   */
  Ali.hideLoading = function(fn) {
    Ali.call("hideLoading");
    fn && fn({});
  };
  /**
   * 开新窗口
   * @param {string|object} opt 调用参数，可为对象或字符串
   * @param {string} opt.url 要打开的url
   * @param {function} fn 回调函数
   * @memberOf Ali
   * @example
   * Ali.pushWindow({
   *     url: "http://www.baidu.com"
   * }, function() {
   *     alert("end pushWindow");
   * });
   */
  Ali.pushWindow = function(opt, fn) {
    var def = {
      url: ""
    };
    if (isStr(opt)) {
      opt = {
        url: opt
      };
    }
    simpleExtend(def, opt);
    if (def.param && (compareVersion("8.3") < 0) && ((/android/i).test(Ali.ua))) {
      console.warn("Ali.pushWindow: android 版 param 参数请在 8.3 及以上版本使用");
    }
    //兼容8.0，转化为绝对路径
    var aEl = document.createElement("a");
    aEl.href = def.url;
    def.url = aEl.href;
    Ali.call("pushWindow", def);
    fn && fn({});
  };
  /**
   * 关闭窗口
   * @param {function} fn 回调函数
   * @memberOf Ali
   * @example
   * Ali.popWindow(function() {
   *     alert("end popWindow");
   * });
   */
  Ali.popWindow = function(fn) {
    Ali.popTo({
      step: -1
    });
    fn && fn({});
  };
  /**
   * 退回指定界面
   * @param {number|object} opt 调用参数，可为对象或数字
   * @param {number} opt.step 往前或往后移动的步数
   * @param {function} fn 回调函数
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @todo 参数差别较大
   * @example
   * Ali.popTo({
   *     step: -1
   * }, function() {
   *     alert("end popTo");
   * });
   */
  Ali.popTo = function(opt, fn) {
    var def = {};
    if (isNumber(opt)) {
      opt = {
        step: opt
      };
    }
    simpleExtend(def, opt);
    def.index = def.step;
    Ali.call("popTo", def, fn);
  };
  /**
   * 唤起钱包登录功能；
   * 调用login可以延续钱包的登录session, 一般会有免登，不会弹出钱包登录界面
   * @param {function} fn 回调函数；回调函数执行时，一定是登录已经成功
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @example
   * Ali.login(function() {
   *     alert("end login");
   * });
   */
  Ali.login = function(fn) {
    Ali.call("login", fn);
  };
  /**
   * 快捷支付native接口，在支付宝和接入支付宝快捷支付SDK的应用中有效
   * @param {string|object} opt 调用参数，可为对象或字符串
   * @param {string} opt.tradeNO 交易号。多个用";"分隔
   * @param {string} opt.partnerID 商户id
   * @param {string} opt.bizType 交易类型，默认为 trade
   * @param {string} opt.bizSubType 交易子类型
   * @param {bool} opt.displayPayResult 是否显示支付结果页，默认为 true
   * @param {string} opt.bizContext 支付额外的参数，格式为JSON字符串
   * @param {string} opt.orderStr 完整的一个支付字符串
   * @param {function} fn 回调函数
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @example
   * Ali.tradePay({
   *     tradeNO: "201209071234123221"
   * }, function() {
   *     alert("end tradePay");
   * });
   */
  Ali.tradePay = function(opt, fn) {
    Ali.call("tradePay", opt, fn);
  };
  /**
   * h5支付接口，弹出H5页面让用户支付
   * <br>支付宝不支持此接口，支付宝请使用 Ali.tradePay
   * @param {object} opt 调用参数
   * @param {string} opt.signStr 服务端生成的加签支付字符串
   * @param {string} opt.alipayURL wap支付的地址,当极简支付无法支持的时候或者用户设置了不用新版支付，都会采用wap支付
   * @param {string} [opt.backURL] 表示成功后的跳转
   * @param {string} opt.unSuccessUrl 表示不成功后的跳转(可能失败，也有可能用户取消等等)后的url，
   *     这个url我们会在调用前加入支付宝返回的结果，格式如下<br>
   *     {
   *         "result" : "",
   *         "memo" : "用户中途取消",
   *         "ResultStatus" : "6001"
   *     }
   * @param {function} fn 回调函数
   * @memberOf Ali
   */
  Ali.h5TradePay = function(opt, fn) {
    console.error("支付宝不支持 Ali.h5TradePay，支付宝请使用 Ali.tradePay");
    fn({
      errorCode: 1,
      errorMessage: "接口不存在"
    });
  };
  Ali.geolocation = {};
  /**
   * 获取位置信息
   * @alias geolocation.getCurrentPosition
   * @param {object} opt 调用参数，可选
   * @param {number} opt.timeout 超时返回时间，单位ms，默认为 15000ms
   * @param {function} fn 回调函数
   * @param {double} fn.coords.latitude 纬度
   * @param {double} fn.coords.longitude 经度
   * @param {string} fn.city 城市
   * @param {string} fn.province 省份
   * @param {string} fn.cityCode 城市编码
   * @param {array} fn.address 地址
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @example
   * Ali.geolocation.getCurrentPosition(function(result) {
   *     alert(JSON.stringify(result));
   * });
   */
  Ali.geolocation.getCurrentPosition = function(opt, fn) {
    if (arguments.length == 1) {
      var fn = opt,
        opt = {
          timeout: 15000
        };
    }
    var timer = setTimeout(function() {
      timer = null;
      console.error("geolocation.getCurrentPosition: timeout");
      var result = {
        errorCode: 5,
        errorMessage: "调用超时"
      };
      fn(result);
    }, opt.timeout);
    Ali.call("getLocation", function(result) {
      if (timer) {
        clearTimeout(timer);
        result.coords = {};
        result.coords.latitude = +result.latitude;
        result.coords.longitude = +result.longitude;
        result.city = result.city ? result.city : result.province;
        result.province = result.province;
        result.cityCode = result.citycode;
        result.address = result.pois;
        fn(result);
      }
    });
  };
  Ali.shake = {};
  /**
   * 摇一摇
   * @alias shake.watch
   * @param {object} opt 调用参数，可为对象或字符串
   * @param {function} opt.onShake
   * @param {function} fn 回调函数
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @todo 暂时不支持 opt 参数
   * @example
   * Ali.shake.watch({
   *     onShake: function() {
   *         alert("onShake");
   *     }
   * }, function() {
   *     alert("end shake");
   * });
   */
  Ali.shake.watch = function(opt, fn) {
    Ali.call("watchShake", opt, fn);
  };
  Ali.vibration = {};
  /**
   * 调用震动
   * @alias vibration.vibrate
   * @param {number|object} opt 调用参数，可为对象或数字
   * @param {number} opt.duration 震动时间
   * @param {function} fn 回调函数
   * @todo 暂时不支持 opt
   * @memberOf Ali
   * @example
   * Ali.vibration.vibrate({
   *     duration: 3000
   * }, function() {
   *     alert("end vibrate");
   * });
   */
  // var def = {
  //     duration: 0
  // };
  Ali.vibration.vibrate = function(opt, fn) {
    var def = {};
    if (isNumber(opt)) {
      opt = {
        duration: opt
      };
    }
    simpleExtend(def, opt);
    Ali.call("vibrate", def);
    fn({});
  };
  Ali.network = {};
  /**
   * 获取网络状态
   * @alias network.getType
   * @param {object} opt 调用参数，可选
   * @param {number} opt.timeout 超时返回时间，单位ms，默认为 15000ms
   * @param {function} fn 回调函数
   * @param {object} fn.result 包含各种网络状况的对象
   * @param {boolean} fn.result.is3G 是否在使用3G网络
   * @param {boolean} fn.result.is2G 是否在使用2G网络
   * @param {boolean} fn.result.isWifi 是否在使用 Wifi
   * @param {boolean} fn.result.isE 是否处于 E
   * @param {boolean} fn.result.isG 是否处于 G
   * @param {boolean} fn.result.isH 是否处于 H
   * @param {boolean} fn.result.isOnline 是否联网
   * @param {string} fn.result.type 网络类型
   * @param {boolean} fn.networkAvailable 网络是否连网可用
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @todo 目前仅支持判断是否 wifi 连接以及是否联网
   * @example
   * Ali.network.getType(function(result, networkAvailable) {
   *     alert(JSON.stringify(result));
   * });
   */
  Ali.network.getType = function(opt, fn) {
    if (arguments.length == 1) {
      var fn = opt,
        opt = {
          timeout: 15000
        };
    }
    var timer = setTimeout(function() {
      timer = null;
      console.error("network.getType: timeout");
      var result = {
        errorCode: 5,
        errorMessage: "调用超时"
      };
      fn(result);
    }, opt.timeout);
    Ali.call("getNetworkType", function(result) {
      if (timer) {
        clearTimeout(timer);
        result.networkAvailable = result.networkType !== "fail";
        result.is3G = result.is2G = result.isE = result.isG = result.isH = false;
        result.isWifi = result.networkType === "wifi";
        result.isOnline = result.networkAvailable;
        result.type = result.networkType;
        fn(result, result.networkAvailable);
      }
    });
  };
  Ali.calendar = {};
  /**
   * 添加日历事件
   * 备注：frequency 和 recurrenceTimes 若有值，则都必须有值
   * @alias calendar.add
   * @param {object} opt 调用参数
   * @param {string} opt.title 日历标题，必选
   * @param {string} opt.location 事件发生地点，可选
   * @param {string} opt.startDate 开始时间，必选
   * @param {string} opt.endDate 结束时间，必选
   * @param {int} opt.alarmOffset 事件开始前多少分钟提醒，可选，默认值为 15
   * @param {int} opt.recurrenceTimes 循环发生次数，可选，默认值为 0（不循环）
   * @param {string} opt.frequency 循环频率(year/month/week/day)，可选，默认不循环
   * @param {string} opt.notes 事件内容，可选
   * @param {function} fn 回调函数
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @example
   * Ali.calendar.add({
   *      title: "日历测试",
   *      startDate: "2014-07-09 14:20:00",
   *      endDate: "2014-07-09 14:40:00",
   *      location: "黄龙时代广场",
   *      notes: "日历事件内容日历事件内容日历事件内容",
   *      alarmOffset: 10,
   *      recurrenceTimes: 2,
   *      frequency: "day"
   * }, function(result) {
   *     alert(JSON.stringify(result));
   * });
   */
  Ali.calendar.add = function(opt, fn) {
    if (compareVersion("8.3") < 0) {
      console.error("Ali.calendar.add: 在 8.3 及以上版本使用");
      fn({
        errorCode: 1,
        errorMessage: "接口不存在"
      });
    } else {
      Ali.call("addEventCal", opt, fn);
    }
  };
  /**
   * 拍照/选择照片
   * @param {object} opt 调用参数，为对象
   * @param {string} opt.dataType 结果数据格式：dataurl|fileurl|remoteurl
   * @param {string} opt.cameraType 指定是前置摄像头还是后置摄像头，front(前置)，back(后置)
   * @param {boolean} opt.allowedEdit 是否允许编辑(框选). 为true时，拍照时会有一个方形的选框
   * @param {string} opt.src 图片来源：gallary|camera
   * @param {string} opt.maskImg 遮罩图片地址
   * @param {string} opt.maskWidth 遮罩宽度
   * @param {string} opt.maskHeight 遮罩高度
   * @param {number} opt.maxWidth 图片的最大宽度. 过大将被等比缩小
   * @param {number} opt.maxHeight 图片的最大高度. 过大将被等比缩小
   * @param {string} opt.format jpg|png
   * @param {number} opt.quality 图片质量, 取值1到100
   * @param {function} fn 回调函数
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @param {string} fn.photo 照片信息，为 dataUrl 或者 fileUrl
   * @memberOf Ali
   * @todo 暂不支持 src, cameraType, maskImg, maskWidth, maskHeight
   * @todo dataType 不支持 remoteurl
   * @example
   * Ali.photo({
   *     dataType: "dataurl",
   *     allowedEdit: true,
   *     src: "camera",
   *     format: "jpg",
   *     quality: 100
   * }, function() {
   *     alert("end photo");
   * });
   */
  Ali.photo = function(opt, fn) {
    var def = {
      format: "jpg",
      dataType: "dataurl",
      quality: 50,
      allowEdit: false,
      src: undefined,
      cameraType: undefined,
      maskImg: undefined,
      maskWidth: undefined,
      maskHeight: undefined
    };
    simpleExtend(def, opt);
    def.imageFormat = def.format;
    if (def.dataType == "remoteurl") {
      def.dataType = "dataurl";
    }
    def.dataType = def.dataType.slice(0, -3) + def.dataType.slice(-3).toUpperCase();
    Ali.call("photo", def, function(result) {
      if (result.dataURL) {
        result.dataURL = "data:image/" + def.imageFormat + ";base64," + result.dataURL;
      }
      result.photo = result.dataURL || result.fileURL;
      result.errorMessage = result.error == 10 ? "用户取消" : result.errorMessage;
      fn(result);
    });
  };
  Ali.contacts = {};
  /**
   * 调用本地通讯录
   * @alias contacts.get
   * @param {object} opt 调用参数，为对象，可选
   * @param {boolean} opt.multiple 是否多选，默认为 false
   * @param {function} fn 回调函数
   * @param {array} fn.results 联系人数组
   * @param {string} fn.results[i].name 联系人姓名
   * @param {string} fn.results[i].phoneNumber 联系人号码
   * @param {string} fn.results[i].email 联系人 email
   * @param {number} fn.errorCode 错误码
   * @param {string} fn.errorMessage 错误信息
   * @memberOf Ali
   * @todo 暂时不支持 email
   * @todo 暂时不支持 multiple
   * @example
   * Ali.contacts.get(function(result) {
   *     alert(JSON.stringify(result));
   * });
   */
  Ali.contacts.get = function(opt, fn) {
    if (arguments.length == 1) {
      var fn = opt,
        opt = {
          multiple: false
        };
    }
    Ali.call("contact", function(result) {
      result.results = [];
      result.results[0] = {
        phoneNumber: result.mobile,
        email: undefined,
        name: result.name
      };
      switch (result.errorCode) {
        case 10:
          result.errorMessage = "没有权限";
          break;
        case 11:
          result.errorMessage = "用户取消操作";
          break;
      }
      fn(result);
    });
  };
  // ------------------
  // 以下接口暂时不支持
  /*Ali.motion = {};
      Ali.audio = {};
      Ali.orientation = {};

      Ali.network.watch = Ali.network.clearWatch = Ali.motion.watch = Ali.motion.clearWatch = 
          Ali.audio.play = Ali.audio.stop = Ali.orientation.watch = Ali.orientation.clearWatch =
          Ali.geolocation.clearWatch = Ali.network.watch = Ali.network.clearWatch = function() {
              if (arguments.length > 0 && typeof arguments[arguments.length - 1] === "function") {
                  var result = {
                          errorCode: 3,
                          errorMessage: "未知错误"
                      };

                  arguments[arguments.length - 1](result);
              }
          };*/
  // ------------------
  // ------------------
  // 仅供支付宝钱包使用
  (["startApp", "showOptionMenu", "hideOptionMenu", "setOptionMenu", "showToolbar", "hideToolbar", "closeWebview", "sendSMS", "scan", "getSessionData", "setSessionData", "showAlert", "alert", "confirm", "checkJSAPI", "checkApp", "isInstalledApp", "share", "openInBrowser", "deposit", "remoteLogging", "alipayContact", "getConfig", "getCities", "rsa", "getWifiList", "connectWifi", "notifyWifiShared", "thirdPartyAuth", "getThirdPartyAuthcode", "setToolbarMenu", "exitApp", "actionSheet", "hideBackButton", "getJSCoreVar", "JSCoreMethod", "startPackage", "getSharedData", "setSharedData", "removeSharedData", "setClipboard", "startDownload", "stopDownload", "getDownloadInfo", "detectBeacons", "startBeaconsBeep", "stopBeaconsBeep", "startIndoorLocation", "stopIndoorLocation", "addEventCal", "startSpeech", "stopSpeech", "rpc", "getWifiInfo", "clearAllCookie", "getMtopToken", "getClientInfo", "sinasso", "getClipboard", "checkBLEAvalability", "scanBeacons", "isSpeechAvailable", "speechRecognizer", "contactSync"]).forEach(function(methodName) {
    Ali[methodName] = function() {
      var args = [].slice.call(arguments);
      Ali.call.apply(null, ([methodName]).concat(args));
    };
  });
  // ----------------
  /**
   * 绑定全局事件
   * @param {string} event 事件名称，多个事件可用空格分隔开
   * @param {function} fn 回调函数
   * @memberOf Ali
   */
  Ali.on = function(event, fn) {
    event.split(/\s+/g).forEach(function(eventName) {
      document.addEventListener(eventName, fn, false);
    });
  };

  function isStr(fn) {
    return 'string' === type(fn);
  }

  function isObj(o) {
    return 'object' === type(o);
  }

  function isNumber(num) {
    return "number" === type(num);
  }

  function type(obj) {
    return Object.prototype.toString.call(obj).replace(/\[object (\w+)\]/, '$1').toLowerCase();
  }

  function simpleExtend(target, source) {
    for (var k in source) {
      target[k] = source[k];
    }
    return target;
  }

  function checkError(result, name) {
    if (result.errorCode) {
      console.error(name + " 发生异常: " + "errorCode: " + result.errorCode + ", errorMessage: " + result.errorMessage);
    }
  }

  function compareVersion(targetVersion) {
    var alipayVersion = Ali.alipayVersion.split("."),
      targetVersion = targetVersion.split(".");
    for (var i = 0, n1, n2; i < alipayVersion.length; i++) {
      n1 = parseInt(targetVersion[i], 10) || 0;
      n2 = parseInt(alipayVersion[i], 10) || 0;
      if (n2 > n1) return 1;
      if (n2 < n1) return -1;
    }
    return 0;
  }
  module.exports = Ali;
});