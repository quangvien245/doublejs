/// <reference path='doublejs.init.ts' />
// include <base> module
/**
 * Init & define core...
 */
dj.init({namespace: {prefix: 'dj'}}, function () {

    // The private function to init an object
    function __init__(...args:any[]) {
        // copy data to objInstance
        let objInstance:any = args[0];
        let objData:any[] = args[1];
        dj.debug(objInstance.toString() + '::__init__');
        //for (let i = 0; i < objData.length; i++) {
        //    dj.jWrapper().extend(objInstance, objData[i]);
        //}
        if (typeof objData[0] === 'object') {
            dj.jWrapper().extend(objInstance, objData[0]);
        }
        // Always call function initialize
        dj.debug(objInstance.toString() + '.initialize.call');
        objInstance.initialize();
    }

    //--------------------------------------------//
    /**
     * Define Base class
     */
    class Base implements IBaseClass {
        public static __STATIC__:any = 'class';

        constructor(...args:any[]) {
            // (!!!) Remove this code when release
            dj.debug(this.getClassName() + '.constructor.call');
            __init__(this, arguments);
        }

        //@Override
        public toString() {
            return this.getClassName();
        }

        public getClass() {
            let base:any = this.constructor;
            return base['_class'];
        }

        public getClassName() {
            let _class = this.getClass();
            if (_class) {
                return _class.getFullName();
            }
            return 'UNDEFINED'; //dj.UNDEFINED;
        }

        public getCType() {
            let _class = this.getClass();
            if (_class) {
                return _class.getCType();
            }
            return dj.UNDEFINED;
        }

        public getPackage() {
            let _class = this.getClass();
            if (_class) {
                return _class.getPackage();
            }
            return dj.NULL;
        }

        public initialize() {
        }

        public instanceOf(cls:any):boolean {
            if (typeof cls === 'function') {
                if (cls.hasOwnProperty('_class')) {
                    let _class:IClass;
                    _class = cls['_class'];
                    if (_class === this.getClass()) {
                        return true;
                    } else if (_class.getFullName() === this.getClassName()) {
                        return true;
                    }
                }
                // try to detect
                return (this instanceof cls);
            }
            // error
            throw new TypeError('You must input a function(|class).');
        }

        public static initClass(config) {
            let base = this; // this === Base.
            if (!base.__STATIC__ || base.__STATIC__ === 'class') {
                base.__STATIC__ = config || {};
            }
        }
    }

    /**
     * Define default Service class
     */
    class BaseService extends Base implements IService {
        public run():void { dj.debug(' This is base service (default)! '); }
    }

    /**
     * The service factory
     */
    class BaseServiceFactory extends Base {

        public static createService(serviceName:string, config:any) {
            let service:any = dj.create(serviceName, config);
            if (dj.isService(service)) {
                return service;
            } else {
                return dj.create(BaseService);
            }
        }

    }

    // Register class: [ Base, BaseService, BaseServiceFactory ]
    dj.register(Base, 'core.Base');
    dj.register(BaseService, 'core.BaseService');
    dj.register(BaseServiceFactory, 'core.BaseServiceFactory');
});
