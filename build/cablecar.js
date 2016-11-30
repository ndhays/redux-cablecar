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
	
	var car = void 0;
	
	var middleware = function middleware(store) {
	  return function (next) {
	    return function (action) {
	      switch (action.type) {
	        case 'CABLE_CAR_INITIALIZED':
	          car = action.car;
	          break;
	        // case 'CABLE_CAR_CONNECTED':
	        //   break;
	        case 'CABLE_CAR_DISCONNECTED':
	          car = null;
	          break;
	        case 'CABLE_CAR_DISCONNECT':
	          car.unsubscribe();
	          car.disconnected();
	          break;
	        case 'CABLE_CAR_CHANGE_CHANNEL':
	          car.changeChannel(action.channel, action.options || {});
	          break;
	        default:
	          break;
	      }
	
	      if (car && !action.ActionCable__flag) {
	        car.send(action);
	      }
	
	      return action.optimistic || action.ActionCable__flag ? next(action) : store.getState();
	    };
	  };
	};
	
	middleware.connect = function (store, channel, options) {
	  return new _cableCar2.default(store, channel, options);
	};
	
	exports.default = middleware;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/* global ActionCable */
	
	var CableCar = function CableCar(store, channel) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	
	  _classCallCheck(this, CableCar);
	
	  _initialiseProps.call(this);
	
	  if (typeof ActionCable === 'undefined') {
	    throw new Error('CableCar tried to connect to ActionCable but ActionCable is not defined');
	  }
	
	  this.params = Object.assign({ channel: channel }, options);
	  this.store = store;
	  this.subscription = this.initialize(this.params);
	}
	
	// Redux dispatch function
	
	
	// ActionCable callback functions
	
	
	// ActionCable subscription functions (exposed globally)
	;
	
	var _initialiseProps = function _initialiseProps() {
	  var _this = this;
	
	  this.initialize = function (params) {
	    return ActionCable.createConsumer().subscriptions.create(params, {
	      initialized: _this.initialized,
	      connected: _this.connected,
	      disconnected: _this.disconnected,
	      received: _this.received,
	      rejected: _this.rejected
	    });
	  };
	
	  this.changeChannel = function (channel) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    _this.subscription.unsubscribe();
	    _this.params = Object.assign({ channel: channel }, options);
	    _this.subscription = _this.initialize(_this.params);
	  };
	
	  this.dispatch = function (msg) {
	    return _this.store.dispatch(Object.assign(msg, { ActionCable__flag: true }));
	  };
	
	  this.initialized = function () {
	    return _this.dispatch({ type: 'CABLE_CAR_INITIALIZED', car: _this });
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
	    throw new Error('Attempt to connect Redux store and ActionCable channel via CableCar failed. ' + data);
	  };
	
	  this.perform = function (action, data) {
	    return _this.subscription.perform(action, data);
	  };
	
	  this.send = function (action) {
	    return _this.subscription.send(action);
	  };
	
	  this.unsubscribe = function () {
	    return _this.subscription.unsubscribe();
	  };
	};
	
	exports.default = CableCar;

/***/ }
/******/ ]);
//# sourceMappingURL=cablecar.js.map