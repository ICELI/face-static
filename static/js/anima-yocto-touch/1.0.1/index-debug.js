define("anima-yocto-touch/1.0.1/index-debug", ["anima-yocto-core/1.1.0/index-debug", "anima-yocto-event/1.0.1/index-debug"], function(require, exports, module) {
  require("anima-yocto-touch/1.0.1/src/touch-debug");
});
define("anima-yocto-touch/1.0.1/src/touch-debug", ["anima-yocto-core/1.1.0/index-debug", "anima-yocto-event/1.0.1/index-debug"], function(require, exports, module) {
  // Thanks to: https://github.com/ftlabs/fastclick
  var $ = Yocto = require("anima-yocto-core/1.1.0/index-debug"),
    Gesture = {
      init: function(name) {
        var gesture = this[name];
        Object.keys(gesture.handler).forEach(function(prop) {
          document.addEventListener(prop, gesture.handler[prop], false);
        });
        gesture.events.forEach(function(eventName) {
          $.fn[eventName] = function(callback) {
            return this.on(eventName, callback)
          };
        });
      }
    };
  require("anima-yocto-event/1.0.1/index-debug")
  var deviceIsAndroid = navigator.userAgent.toLowerCase().indexOf('android') > 0,
    deviceIsIOS = /ip(ad|hone|od)/.test(navigator.userAgent.toLowerCase());
  var yoctoTouch = {
    trackingClick: false,
    trackingClickStart: 0,
    targetElement: null,
    touchStartX: 0,
    touchStartY: 0,
    lastTouchIdentifier: 0,
    touchBoundary: 10,
    tapDelay: 200,
    sendClick: function(targetElement, event) {
      // 在click之前触发tap事件
      var tap = $.Event('tap', {
        animaTap: true
      })
      $(targetElement).trigger(tap);
      // if(yoctoTouch.isDouleTap){
      //     $(targetElement).trigger('doubleTap');
      //     yoctoTouch.isDouleTap = false;
      //     delete yoctoTouch.last;
      // }
      var clickEvent, touch;
      // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
      if (document.activeElement && document.activeElement !== targetElement) {
        document.activeElement.blur();
      }
      touch = event.changedTouches[0];
      // Synthesise a click event, with an extra attribute so it can be tracked
      clickEvent = document.createEvent('MouseEvents');
      clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
      clickEvent.animaClick = true;
      targetElement.dispatchEvent(clickEvent);
    },
    needClick: function(target) {
      switch (target.nodeName.toLowerCase()) {
        // Don't send a synthetic click to disabled inputs (issue #62)
        case 'button':
        case 'select':
        case 'textarea':
          if (target.disabled) {
            return true;
          }
          break;
        case 'input':
          // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
          if ((deviceIsIOS && target.type === 'file') || target.disabled) {
            return true;
          }
          break;
        case 'label':
        case 'video':
          return true;
      }
      return false;
    },
    focus: function(targetElement) {
      var length;
      // on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
      if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
        length = targetElement.value.length;
        targetElement.setSelectionRange(length, length);
      } else {
        targetElement.focus();
      }
    },
    needFocus: function(target) {
      switch (target.nodeName.toLowerCase()) {
        case 'textarea':
        case 'select': //实测android下select也需要
          return true;
        case 'input':
          switch (target.type) {
            case 'button':
            case 'checkbox':
            case 'file':
            case 'image':
            case 'radio':
            case 'submit':
              return false;
          }
          // No point in attempting to focus disabled inputs
          return !target.disabled && !target.readOnly;
        default:
          return false;
      }
    },
    updateScrollParent: function(targetElement) {
      var scrollParent, parentElement;
      scrollParent = targetElement.yoctoTouchScrollParent;
      // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
      // target element was moved to another parent.
      if (!scrollParent || !scrollParent.contains(targetElement)) {
        parentElement = targetElement;
        do {
          if (parentElement.scrollHeight > parentElement.offsetHeight) {
            scrollParent = parentElement;
            targetElement.yoctoTouchScrollParent = parentElement;
            break;
          }
          parentElement = parentElement.parentElement;
        } while (parentElement);
      }
      // Always update the scroll top tracker if possible.
      if (scrollParent) {
        scrollParent.yoctoTouchLastScrollTop = scrollParent.scrollTop;
      }
    },
    findControl: function(labelElement) {
      // Fast path for newer browsers supporting the HTML5 control attribute
      if (labelElement.control !== undefined) {
        return labelElement.control;
      }
      // All browsers under test that support touch events also support the HTML5 htmlFor attribute
      if (labelElement.htmlFor) {
        return document.getElementById(labelElement.htmlFor);
      }
      // If no for attribute exists, attempt to retrieve the first labellable descendant element
      // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
      return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    },
    touchHasMoved: function(event) {
      var touch = event.changedTouches[0],
        boundary = yoctoTouch.touchBoundary;
      if (Math.abs(touch.pageX - yoctoTouch.touchStartX) > boundary || Math.abs(touch.pageY - yoctoTouch.touchStartY) > boundary) {
        return true;
      }
      return false;
    }
  };
  Gesture.tap = {
    events: ['tap'],
    handler: {
      touchstart: function(event) {
        var targetElement, touch, selection;
        // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the yoctoTouch element (issue #111).
        if (event.targetTouches.length > 1) {
          return true;
        }
        targetElement = event.target;
        touch = event.targetTouches[0];
        if (deviceIsIOS) {
          // Only trusted events will deselect text on iOS (issue #49)
          selection = window.getSelection();
          if (selection.rangeCount && !selection.isCollapsed) {
            return true;
          }
          if (touch.identifier && touch.identifier === yoctoTouch.lastTouchIdentifier) {
            event.preventDefault();
            return false;
          }
          yoctoTouch.lastTouchIdentifier = touch.identifier;
          yoctoTouch.updateScrollParent(targetElement);
        }
        yoctoTouch.trackingClick = true;
        yoctoTouch.trackingClickStart = event.timeStamp;
        yoctoTouch.targetElement = targetElement;
        // var now = Date.now(),
        //     delta = now - (yoctoTouch.last || now);
        // if(delta > 0 && delta <= 250){
        //     yoctoTouch.isDouleTap = true;
        // }
        // yoctoTouch.last = now;
        yoctoTouch.touchStartX = touch.pageX;
        yoctoTouch.touchStartY = touch.pageY;
        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - yoctoTouch.lastClickTime) < yoctoTouch.tapDelay) {
          event.preventDefault();
        }
        return true;
      },
      touchmove: function(event) {
        if (!yoctoTouch.trackingClick) {
          return true;
        }
        // If the touch has moved, cancel the click tracking
        if (yoctoTouch.targetElement !== event.target || yoctoTouch.touchHasMoved(event)) {
          yoctoTouch.trackingClick = false;
          yoctoTouch.targetElement = null;
        }
        return true;
      },
      touchend: function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = yoctoTouch.targetElement;
        if (!yoctoTouch.trackingClick) {
          return true;
        }
        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - yoctoTouch.lastClickTime) < yoctoTouch.tapDelay) {
          yoctoTouch.cancelNextClick = true;
          return true;
        }
        // Reset to prevent wrong click cancel on input (issue #156).
        yoctoTouch.cancelNextClick = false;
        yoctoTouch.lastClickTime = event.timeStamp;
        trackingClickStart = yoctoTouch.trackingClickStart;
        yoctoTouch.trackingClick = false;
        yoctoTouch.trackingClickStart = 0;
        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === 'label') {
          forElement = yoctoTouch.findControl(targetElement);
          if (forElement) {
            yoctoTouch.focus(targetElement);
            if (deviceIsAndroid) {
              return false;
            }
            targetElement = forElement;
          }
        } else if (yoctoTouch.needFocus(targetElement)) {
          // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
          // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
          if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
            yoctoTouch.targetElement = null;
            return false;
          }
          yoctoTouch.focus(targetElement);
          // input类型元素阻止默认事件
          event.preventDefault();
          yoctoTouch.sendClick(targetElement, event);
          // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
          // Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
          // if (!deviceIsIOS || targetTagName !== 'select') {
          //     yoctoTouch.targetElement = null;
          //     event.preventDefault();
          // }
          return false;
        }
        if (deviceIsIOS) {
          // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
          // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
          scrollParent = targetElement.yoctoTouchScrollParent;
          if (scrollParent && scrollParent.yoctoTouchLastScrollTop !== scrollParent.scrollTop) {
            return true;
          }
        }
        // Prevent the actual click from going though - unless the target node is marked as requiring
        // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
        if (!yoctoTouch.needClick(targetElement)) {
          event.preventDefault();
          yoctoTouch.sendClick(targetElement, event);
        }
        return false;
      },
      touchcancel: function(event) {
        yoctoTouch.trackingClick = false;
        yoctoTouch.targetElement = null;
      }
    }
  }
  Gesture.init('tap')
  if (deviceIsAndroid) { //解决部分安卓机上preventDefault失效的问题
    var os = /\bandroid[ \/-]?([0-9.x]+)?/.exec(navigator.userAgent.toLowerCase());
    if (parseFloat(os[1]) < 4.4) {
      document.addEventListener('click', function(event) {
        if (!event.animaClick) { //阻止浏览器自己触发的点击事件
          if (event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
          } else {
            // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
            event.propagationStopped = true;
          }
          event.stopPropagation()
          event.preventDefault()
          return false
        }
      }, true)
    }
  }
  $.gestures = Gesture;
  module.exports = $;
});