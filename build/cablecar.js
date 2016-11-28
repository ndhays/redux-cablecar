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
	
	var middleware = function middleware(store) {
	
	  var car;
	
	  return function (next) {
	    return function (action) {
	
	      if (action.type === 'CABLE_CAR_INITIALIZED') {
	        car = action.car;
	      } else if (action.type === 'DISCONNECT_CABLE_CAR') {
	        car.unsubscribe();
	      } else if (!action.__ActionCable) {
	        car.send(action);
	      }
	
	      return action.optimistic || action.__ActionCable ? next(action) : store.getState();
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
	
	var CableCar = function CableCar(store, channel) {
	  var _this = this;
	
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	
	  _classCallCheck(this, CableCar);
	
	  this.initialize = function (params) {
	    return ActionCable.createConsumer().subscriptions.create(params, {
	      initialized: _this.initialized,
	      connected: _this.connected,
	      disconnected: _this.disconnected,
	      received: _this.received,
	      rejected: _this.rejected
	    });
	  };
	
	  this.dispatch = function (msg) {
	    return _this.store.dispatch(Object.assign(msg, { __ActionCable: true }));
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
	    _this.dispatch({ type: 'CABLE_CAR_REJECTED' });
	    throw 'Attempt to connect Redux store and ActionCable channel via CableCar failed. ' + data;
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
	
	  if (typeof ActionCable == 'undefined') {
	    throw 'CableCar tried to connect to ActionCable but ActionCable is not defined';
	  }
	
	  this.params = Object.assign(channel, options);
	  this.store = store;
	  this.subscription = this.initialize(this.params);
	}
	
	// Redux dispatch function
	
	
	// ActionCable callback functions
	
	
	// ActionCable subscription functions
	;
	
	exports.default = CableCar;

/***/ }
/******/ ]);
//# sourceMappingURL=cablecar.js.map