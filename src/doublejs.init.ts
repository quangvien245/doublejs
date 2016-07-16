/// <reference path='jquery.d.ts' />
// include <init> module
/**
 * Init & define core...
 */

/**
 * A package structure
 */
declare interface IPackage {
    __pre__:any;
    previous:Function;
}

/**
 * Represent for a class
 */
declare interface IClass {
    getName():string; // return class name with full path.
    getNameOnly():string;
    getFullName():string;
    getCType():string;
    getPackage():IPackage;
    getBaseClass():IBaseClass;
}

/**
 * Class config
 */
declare interface IClassConfig {
    className:string;
    ctype:string;
}

/**
 * A base class interface
 */
declare interface IBaseClass {
    getClass():IClass;
    getClassName():string;
    getCType():string;
    getPackage():any; // get current package.
}

/**
 * To manage all classes
 */
interface IClassHelper {
    hasClass(name):boolean;
    add(cls):any; // return the class after added.
    get(name):any; // return class.
}

/**
 * A service interface
 */
interface IService {
    run(...config:any[]):void;
}


/**
 * The Double JS (DJ | JJ) library.
 * @type {object} (global)
 */
let dj = (function ($:JQueryStatic) {

    // Global JJ instance
    let _instance:any;

    // Constants
    const NULL = null;
    const UNDEFINED = undefined;

//-----------------------------------------------//
//              Private data                     //
//-----------------------------------------------//

    /**
     * Define oClass class
     */
    class oClass implements IClass {
        private _baseClass:any;
        private _package:IPackage;

        public className:string;
        public ctype:string;
        public namespaces:string[];

        /**
         * oClass constructor
         * @param base
         * @param config
         */
        constructor(base:IBaseClass, config:IClassConfig) {
            // validate class & cfg-info
            if (typeof base != 'function') {
                throw new TypeError('The base class is invalid.')
            }
            if (!config) {
                throw new TypeError('The class cfg-info can not missed.')
            }
            if (typeof config.className != 'string' || config.className === '') {
                throw new TypeError('The class name is invalid.')
            }

            // init class info
            this._baseClass = base;
            this.className = config['className'];
            if (config.ctype) {
                this.ctype = config['ctype'];
            } else {
                this.ctype = UNDEFINED;
            }

            // process namespace
            this.namespaces = this.className.split('.');

            // Register namespace to JJ
            this._package = _instance.namespace(this.namespaces, this._baseClass);
        }

        /**
         * Get owner class name (@see: getFullName).
         * @returns {string}
         */
        public getName() {
            return this.getFullName();
        }

        /**
         * Get owner class name only
         * @returns {string}
         */
        public getNameOnly() {
            return this.namespaces[this.namespaces.length - 1];
        }

        /**
         * Get owner class name with full path
         * @returns {string}
         */
        public getFullName() {
            return this.className;
        }

        /**
         * Get owner class ctype
         * @returns {string}
         */
        public getCType() {
            return this.ctype;
        }

        /**
         * Get current package contain owner class
         * @returns {object}
         */
        public getPackage() {
            return this._package;
        }

        /**
         * Get represent class
         * @returns {function}
         */
        public getBaseClass() {
            return this._baseClass;
        }
    }

    //--------------------------------------------//
    /**
     * Define _self as private instance
     */
    let _self:any;
    _self = {
        /**
         * Maybe just call one times
         */
        _init_: function () {
            // (!!!) MODE DEBUG
            _self._enableDebug = true;

            // Check console available ?
            if ((_self._useConsole === true) && console) {
                _self.debug = function (msg) {
                    if (_self._enableDebug === true && msg) {
                        if (arguments.length == 1) {
                            console.log(msg);
                        } else {
                            for (let i = 0; i < arguments.length; i++) {
                                console.log(arguments[i]);
                            }
                        }
                    }
                };
            }

            // remove this method
            _self._init_ = function () {
                _self.debug('The object has initialized!')
            };
        },

        /**
         * @Function Debug use to debug...
         * @param msg
         */
        debug: function (msg) {
            if (_self._enableDebug === true && msg) {
                if (arguments.length == 1) {
                    _self._debugger(msg);
                } else {
                    for (let i = 0; i < arguments.length; i++) {
                        _self._debugger(arguments[i]);
                    }
                }
            }
        },

        /**
         * @Function Save an object into Stores.
         * @param obj
         * @param name
         */
        saveObject: function (obj, name:string = 'undefined') {
            _self.debug('--> save object [' + name + ']');
            _self.Stores[name] = obj;
        },

        /**
         * @Function Get an existed object from Stores.
         * @param name
         * @returns {object}
         */
        getObject: function (name:string = 'undefined'):any {
            return _self.Stores[name];
        },

        /**
         * @Function Get typeof an object.
         * @param o
         * @returns {string}
         */
        getType: function (o):string {
            if (o && (o.hasOwnProperty('initClass') || o.hasOwnProperty('__STATIC__'))) {
                return 'class';
            } else {
                return (typeof o);
            }
        },

        // MODE RELEASE
        _enableDebug: false,

        // Use console to debug if available
        _useConsole: true,

        // Debug function handler
        _debugger: function (msg) {
            return msg;
        },

        // cache class config as '_default'
        _cachedClassCfg: true,

        /**
         * Init a class
         * @param base
         * @param config
         */
        initClass: function (base:any, config:any) {
            // check type
            if (_self.getType(base) !== 'class') {
                //throw new TypeError('Illegal invocation');
                return NULL;
            }

            // create owner class
            base._class = new oClass(base, config);

            // cached config
            if (this._cachedClassCfg === true) {
                base._default = config;
            }

            // return owner class
            return base._class;
        },

        // Store all objects
        Stores: {
            _desc: 'Store all objects.'
        },

        // Store all classes
        Classes: {
            _desc: 'Store all classes.',
            _ctypes: {},
            _classes: {}
        }
    };

    // Call _init_
    _self._init_();

    // jQuery cached
    _self._$ = $;
    _self.jwrapper = $.fn;

    _self.wrapper = function (selector):any {
        if (selector) {
            return _self._$(selector);
        } else {
            return _self._$;
        }
    };
    _self.plugin = function (pName, pFn) {
        _self.jwrapper[pName] = pFn;
    };
//-----------------------------------------------//

//-----------------------------------------------//
// This class is private & has just one instance //
// ----------------------------------------------//
    class JJ {
        public name:string;
        public version:string;
        public configs:any;

        constructor() {
            this.name = 'Double JS';
            this.version = '0.0.1';
        }

        //@Override
        public toString() {
            return (this.name + ' v.' + this.version);
        }

        // Extend a driver class from base class
        public __extends(driver, base) {
            for (let p in base) {
                if (base.hasOwnProperty(p)) driver[p] = base[p];
            }
            function __() {
                this.constructor = driver;
            }

            driver.prototype = (base === null ? Object.create(base) : (__.prototype = base.prototype, new __()));
        }

        /**
         * @Function Init this object.
         */
        public init(configs, _callback) {
            if (configs) {
                let cfg = this.configs || {};
                this.configs = $.extend(cfg, configs);
            }

            if (typeof _callback === 'function') {
                _callback(this);
            }
        }

        /**
         * @Function Add new property for 'this instance'
         */
        public add(prop:string, value:any, force:boolean = false) {
            if (this.hasOwnProperty(prop)) {
                if (force == true) {
                    _self.debug('...Override existed ' + _self.getType(value) + ' [' + prop + ']...');
                    this[prop] = value;
                }
            } else {
                _self.debug('...Add new ' + _self.getType(value) + ' [' + prop + ']...');
                this[prop] = value;
            }
        }

        /**
         * Call a existed function / return an object.
         */
        public invoked(caller:string, fromObj:any, ...args:any[]):any {
            // init...
            let isScopeChange:boolean = false;
            let invoker:any = UNDEFINED;

            // process...
            if (fromObj) {
                if (typeof fromObj[caller] !== 'undefined') {
                    isScopeChange = true;
                    invoker = fromObj[caller];
                }
            } else if (typeof this[caller] !== 'undefined') {
                invoker = this[caller];
            }

            // run...
            if (typeof invoker === 'function' && invoker !== this.invoked) {
                let newArgs:any[] = Array.prototype.slice.call(arguments, 2);
                if (isScopeChange) {
                    _self.debug('...Scope was changed at [' + fromObj.toString() + '.' + name + ']...');
                    return invoker.apply(fromObj, newArgs);
                }
                return invoker();
            }
            return invoker;
        }
    }

    // Create JJ instance and return as: DJ(global)
    _instance = new JJ();
//-----------------------------------------------//

//-----------------------------------------------//
//          Create getter/setter to access       //
//              some private data                //
// ----------------------------------------------//

    $.extend(_instance, (function () {
        return {
            NULL: NULL,
            UNDEFINED: UNDEFINED,

            debug: function (msg) {
                _self.debug(msg);
            },

            saveObject: function (obj, name:string) {
                _self.saveObject(obj, name);
            },

            getObject: function (name:string) {
                return _self.getObject(name);
            },

            getType: function (o) {
                return _self.getType(o);
            },

            jWrapper: function (selector:any = null) {
                return _self.wrapper(selector);
            },

            plugin: function (pName, pFn) {
                _self.plugin(pName, pFn);
            },

            // A shorthand JQuery ready
            ready: function (fn:any) {
                if (fn) {
                    $(document).ready(fn);
                }
            },

            // create namespace
            namespace: function (namespaces:string[], obj:any) {
                let nsLen = namespaces.length;
                if (obj) {
                    nsLen -= 1;
                }
                let item:any = this;
                for (let i = 0; i < nsLen; i++) {
                    if (!item.hasOwnProperty(namespaces[i])) {
                        item[namespaces[i]] = {
                            __pre__: item, previous: function () {
                                return this.__pre__;
                            }
                        };
                    }
                    item = item[namespaces[i]];
                }
                if (obj) {
                    item[namespaces[nsLen]] = obj || {};
                }
                // return package contain the obj
                return item;
            },

            // a shorthand for @Function namespace
            ns: function (path:string) {
                return this.namespace(path.split('.'), UNDEFINED);
            },

            /**
             * Check obj is an instance of cls
             *
             * @param obj
             * @param cls
             * @returns {boolean}
             */
            instanceOf: function (obj:any, cls:any):boolean {
                if (typeof cls === 'function') {
                    if (obj && typeof obj.instanceOf === 'function') {
                        return obj.instanceOf(cls);
                    } else {
                        return (obj instanceof cls);
                    }
                }
                return false;
            },

            /**
             * Access Classes
             * @returns {IClassHelper}
             */
            getClasses: function ():IClassHelper {
                let helper:IClassHelper;
                let classes = _self.Classes;

                if (!classes.hasOwnProperty('helper')) {
                    helper = (function (classes) {
                        return {
                            hasClass: function (name:string) {
                                // Check is c-type... (start with 'cls-')
                                if (name.indexOf('cls-') === 0) {
                                    return classes._ctypes.hasOwnProperty(name);
                                } else {
                                    return classes._classes.hasOwnProperty(name);
                                }
                            },

                            add: function (cls:any) {
                                if (cls && (typeof cls === 'function') && (cls.hasOwnProperty('_class'))) {
                                    // add class
                                    let _class:oClass = cls['_class'];
                                    classes._classes[_class.getFullName()] = cls;
                                    // add class with c-type
                                    let ctype = _class.getCType();
                                    if (ctype) {
                                        classes._ctypes[ctype] = cls;
                                    }
                                    // return current class
                                    return cls;
                                }
                                // the cls is not a class
                                return NULL;
                            },

                            get: function (name:string) {
                                if (this.hasClass(name)) {
                                    let cls:FunctionConstructor;
                                    // Check is c-type... (start with 'cls-')
                                    if (name.indexOf('cls-') === 0) {
                                        cls = classes._ctypes[name];
                                    } else {
                                        cls = classes._classes[name];
                                    }
                                    return cls;
                                }
                                return NULL;
                            }
                        };
                    })(classes);
                    // Cached helper
                    classes['helper'] = helper;
                } else {
                    helper = classes['helper'];
                }

                return helper;
            },

            /**
             * Register a class
             * @param config
             * @param cls
             * @returns {object}
             */
            register: function (cls, config:any):any {
                if (typeof config === 'string') {
                    config = {'className': config};
                }
                // init the cls
                if (NULL != _self.initClass(cls, config)) {
                    // register the cls
                    return _instance.getClasses().add(cls);
                }
                return NULL;
            },

            /**
             * Create an object(instance) of Class
             *
             * @param _class
             * @param config
             * @returns {object}
             */
            create: function (_class:any, config:any = UNDEFINED) {
                let o = NULL;
                switch ((typeof _class)) {
                    case 'string':
                        let cls:FunctionConstructor;
                        cls = _instance.getClasses().get(_class);
                        if (NULL != cls) {
                            o = (new cls(config));
                        }
                        break;
                    case 'function':
                        o = (new _class(config));
                        break;
                    case 'object':
                        o = $.extend(_class, config);
                        break;
                    default:
                        break;
                }
                return o;
            },

            /**
             * Create, extend from a class, or override a class if it existed
             */
            define: function (config:any, baseClass:Function) {
                // Validate config
                if (typeof config === 'string') {
                    config = {className: config};
                }
                if (!config || !config.hasOwnProperty('className')
                    || typeof config['className'] !== 'string' || config['className'] === '') {
                    _instance.debug('The class config is invalid.');
                    return false;
                }

                // Validate base class
                if (!baseClass) {
                    baseClass = _instance.getClasses().get('core.Base');
                } else if (typeof baseClass === 'string') {
                    baseClass = _instance.getClasses().get(baseClass);
                }
                if (typeof baseClass !== 'function' && _instance.getType(baseClass) !== 'class') {
                    _instance.debug('The base class is invalid.');
                    return false;
                }

                // Create new class - template
                let _newClass:any = function () {
                    baseClass.apply(this, arguments);
                };
                _newClass.__STATIC__ = 'class';
                _newClass.initClass = function () {
                };
                // - extend base class
                _instance.__extends(_newClass, baseClass);
                // - register new class
                _instance.register(_newClass, {className: config['className'], ctype: config['ctype']});
                // - test new class register success ???
                _newClass = _instance.getClasses().get(config['className']);
                if (NULL === _newClass) {
                    _instance.debug('An error occurred when create class [' + config['className'] + ']');
                    return false;
                }
                // - copy new config to new class
                if (config.hasOwnProperty('__STATIC__')) {
                    $.extend(_newClass, config['__STATIC__']);
                    delete config['__STATIC__'];
                }
                $.extend(_newClass.prototype, config);

                return true;
            },

            /**
             * Check type of an object is a package
             *
             * @param pkg
             */
            /*
             isPackage: function (pkg):boolean {
             if (pkg) {
             if (pkg.hasOwnProperty('__pre__') && typeof pkg.previous === 'function') {
             return true;
             }
             }
             return false;
             },
             */

            /**
             * Validate a service
             *
             * @param service
             * @returns {boolean}
             */
            isService: function (service):boolean {
                let cls = _instance.getClasses().get('core.BaseService');
                return _instance.instanceOf(service, cls);
            }
        }
    })());

    // (!!!) Just use '_self' for debug only
    if (_self._enableDebug === true) {
        _instance.__self__ = _self;
    }
    _instance['oClass'] = oClass;
//-----------------------------------------------//

    return _instance; //(global)

}(jQuery));
