module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _middleware = __webpack_require__(1);
	
	var _middleware2 = _interopRequireDefault(_middleware);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _middleware2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _cableCar = __webpack_require__(2);
	
	var _cableCar2 = _interopRequireDefault(_cableCar);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var middleware = function middleware(channel, s) {
	  window.console.log(s);
	  var car = new _cableCar2.default(channel);
	
	  return function (store) {
	    return function (next) {
	      return function (action) {
	
	        if (!car.store) {
	          car.store = store;
	        }
	
	        if (action.type === 'CABLE_CAR_INITIALIZED') {
	          car.store = store;
	        } else if (action.type === 'DISCONNECT_CABLE_CAR') {
	          car.unsubscribe();
	        } else if (!action.__ActionCable) {
	          car.send(action);
	        }
	
	        return action.optimistic || action.__ActionCable ? next(action) : store.getState();
	      };
	    };
	  };
	};
	
	exports.default = middleware;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var CableCar = function () {
	  function CableCar(channel) {
	    var _this = this;
	
	    _classCallCheck(this, CableCar);
	
	    this.dispatch = function (msg) {
	      return _this.store ? _this.store.dispatch(Object.assign(msg, { __ActionCable: true })) : false;
	    };
	
	    this.initialized = function () {
	      return _this.dispatch({ type: 'CABLE_CAR_INITIALIZED' });
	    };
	
	    this.connected = function () {
	      return _this.dispatch({ type: 'CABLE_CAR_CONNECTED' });
	    };
	
	    this.disconnected = function () {
	      return _this.dispatch({ type: 'CABLE_CAR_DISCONNECTED' });
	    };
	
	    this.received = function (msg) {
	      return _this.dispatch(msg);
	    };
	
	    this.rejected = function (data) {
	      throw 'Attempt to connect Redux store and ActionCable channel via CableCar failed. ' + data;
	    };
	
	    this.perform = function (action, data) {
	      _this.subscription.perform(action, data);
	    };
	
	    this.send = function (action) {
	      return _this.subscription.send(action);
	    };
	
	    this.unsubscribe = function () {
	      _this.subscription.unsubscribe();
	    };
	
	    if (typeof ActionCable == 'undefined') {
	      throw 'CableCar tried to connect to ActionCable but ActionCable is not defined';
	    }
	
	    this.channel = channel;
	    this.store = null;
	    this.initialize();
	  }
	
	  _createClass(CableCar, [{
	    key: 'initialize',
	    value: function initialize() {
	      this.subscription = ActionCable.createConsumer().subscriptions.create({ channel: this.channel }, {
	        initialized: this.initialized,
	        connected: this.connected,
	        disconnected: this.disconnected,
	        received: this.received,
	        rejected: this.rejected
	      });
	    }
	
	    // ActionCable callback functions
	
	
	    // ActionCable subscription functions
	
	  }]);
	
	  return CableCar;
	}();
	
	exports.default = CableCar;

/***/ }
/******/ ]);
//# sourceMappingURL=cablecar.js.map