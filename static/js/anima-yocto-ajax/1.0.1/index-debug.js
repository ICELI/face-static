define("anima-yocto-ajax/1.0.1/index-debug", ["anima-yocto-core/1.1.0/index-debug", "anima-yocto-event/1.0.1/index-debug"], function(require, exports, module) {
  require("anima-yocto-ajax/1.0.1/src/ajax-debug");
});
define("anima-yocto-ajax/1.0.1/src/ajax-debug", ["anima-yocto-core/1.1.0/index-debug", "anima-yocto-event/1.0.1/index-debug"], function(require, exports, module) {
  var $ = require("anima-yocto-core/1.1.0/index-debug"),
    util = require("anima-yocto-ajax/1.0.1/src/util-debug");
  require("anima-yocto-event/1.0.1/index-debug");
  require("anima-yocto-ajax/1.0.1/src/jsonp-debug");
  require("anima-yocto-ajax/1.0.1/src/miniAjax-debug");
  module.exports = $;
});
define("anima-yocto-ajax/1.0.1/src/util-debug", [], function(require, exports, module) {
  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false) return false
  }

  function ajaxSuccess(data, xhr, settings, deferred) {
      var context = settings.context,
        status = 'success'
      settings.success.call(context, data, status, xhr)
      if (deferred) deferred.resolveWith(context, [data, status, xhr])
      ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
      var context = settings.context
      settings.error.call(context, xhr, type, error)
      if (deferred) deferred.rejectWith(context, [xhr, type, error])
      ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
  }
  module.exports = {
    ajaxBeforeSend: ajaxBeforeSend,
    ajaxSuccess: ajaxSuccess,
    ajaxError: ajaxError
  }
});
define("anima-yocto-ajax/1.0.1/src/jsonp-debug", ["anima-yocto-core/1.1.0/index-debug", "anima-yocto-event/1.0.1/index-debug"], function(require, exports, module) {
  var $ = require("anima-yocto-core/1.1.0/index-debug"),
    util = require("anima-yocto-ajax/1.0.1/src/util-debug");
  require("anima-yocto-event/1.0.1/index-debug");
  var jsonpID = 0,
    document = window.document,
    ajaxBeforeSend = util.ajaxBeforeSend,
    ajaxSuccess = util.ajaxSuccess,
    ajaxError = util.ajaxError;
  $.ajaxJSONP = function(options, deferred) {
    if (!('type' in options)) return $.ajax && $.ajax(options);
    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ? _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = {
        abort: abort
      },
      abortTimeout
    if (deferred) deferred.promise(xhr)
    $(script).on('load error', function(e, errorType) {
      clearTimeout(abortTimeout)
      $(script).off().remove()
      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }
      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback)) originalCallback(responseData[0])
      originalCallback = responseData = undefined
    })
    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }
    window[callbackName] = function() {
      responseData = arguments
    }
    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)
    if (options.timeout > 0) abortTimeout = setTimeout(function() {
      abort('timeout')
    }, options.timeout)
    return xhr
  }
  module.exports = $;
});
define("anima-yocto-ajax/1.0.1/src/miniAjax-debug", ["anima-yocto-core/1.1.0/index-debug", "anima-yocto-event/1.0.1/index-debug"], function(require, exports, module) {
  var $ = require("anima-yocto-core/1.1.0/index-debug"),
    util = require("anima-yocto-ajax/1.0.1/src/util-debug");
  require("anima-yocto-event/1.0.1/index-debug");
  var key,
    name,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/,
    ajaxBeforeSend = util.ajaxBeforeSend,
    ajaxSuccess = util.ajaxSuccess,
    ajaxError = util.ajaxError

  function empty() {}
  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function() {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json: jsonType,
      xml: 'application/xml, text/xml',
      html: htmlType,
      text: 'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text'
  }

  function appendQuery(url, query) {
      if (query == '') return url
      return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }
    // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string") options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) options.url = appendQuery(options.url, options.data), options.data = undefined
  }
  $.ajax = function(options) {
      var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
      for (key in $.ajaxSettings)
        if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]
      if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && RegExp.$2 != window.location.host
      if (!settings.url) settings.url = window.location.toString()
      serializeData(settings)
      if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())
      var dataType = settings.dataType,
        hasPlaceholder = /\?.+=\?/.test(settings.url)
      if (dataType == 'jsonp' || hasPlaceholder) {
        if (!hasPlaceholder) settings.url = appendQuery(settings.url, settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
        return $.ajaxJSONP(settings, deferred)
      }
      var mime = settings.accepts[dataType],
        headers = {},
        setHeader = function(name, value) {
          headers[name.toLowerCase()] = [name, value]
        },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout
      if (deferred) deferred.promise(xhr)
      if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
      setHeader('Accept', mime || '*/*')
      if (mime) {
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
        xhr.overrideMimeType && xhr.overrideMimeType(mime)
      }
      if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')
      if (settings.headers)
        for (name in settings.headers) setHeader(name, settings.headers[name])
      xhr.setRequestHeader = setHeader
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty
          clearTimeout(abortTimeout)
          var result, error = false
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
            dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
            result = xhr.responseText
            try {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              if (dataType == 'script')(1, eval)(result)
              else if (dataType == 'xml') result = xhr.responseXML
              else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
            } catch (e) {
              error = e
            }
            if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
            else ajaxSuccess(result, xhr, settings, deferred)
          } else {
            ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
          }
        }
      }
      if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort()
        ajaxError(null, 'abort', xhr, settings, deferred)
        return xhr
      }
      var async = 'async' in settings ? settings.async : true
      xhr.open(settings.type, settings.url, async)
      for (name in headers) nativeSetHeader.apply(xhr, headers[name])
        // if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        //     xhr.onreadystatechange = empty
        //     xhr.abort()
        //     ajaxError(null, 'timeout', xhr, settings, deferred)
        //   }, settings.timeout)
        // 使用原生timeout属性
      if (settings.timeout > 0) {
        xhr.timeout = settings.timeout
        xhr.ontimeout = function() {
          xhr.onreadystatechange = empty
          xhr.abort()
          ajaxError(null, 'timeout', xhr, settings, deferred)
        }
      }
      // avoid sending empty string (#319)
      xhr.send(settings.data ? settings.data : null)
      return xhr
    }
    // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url,
      data: data,
      success: success,
      dataType: dataType
    }
  }
  $.get = function( /* url, data, success, dataType */ ) {
    return $.ajax(parseArguments.apply(null, arguments))
  }
  $.post = function( /* url, data, success, dataType */ ) {
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }
  $.getJSON = function( /* url, data, success */ ) {
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }
  $.fn.load = function(url, data, success) {
    if (!this.length) return this
    var self = this,
      parts = url.split(/\s/),
      selector,
      options = parseArguments(url, data, success),
      callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response) {
      self.html(selector ? $('<div>').html(response.replace(rscript, "")).find(selector) : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }
  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope) {
    var type, array = $.isArray(obj),
      hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope : scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
        // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object")) serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }
  $.param = function(obj, traditional) {
    var params = []
    params.add = function(k, v) {
      this.push(escape(k) + '=' + escape(v))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
  module.exports = $;
});