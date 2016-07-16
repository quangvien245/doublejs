/// <reference path='doublejs.init.ts' />
// include <helper> class
/**
 * Class helper
 */

module singleton {
    // private function
    function SingletonEnforcer() {
    }

    dj.init(dj.UNDEFINED, function () {
        /**
         * Define Helper class
         */
        class Helper {
            private static _instance:Helper;
            private queryString:any = {
                qs:{},
                get: function (paramName) {
                    if (this.qs.hasOwnProperty(paramName)) {
                        return this.qs[paramName];
                    }
                },
                set: function (paramName, value) {
                    this.qs[paramName] = value;
                }
            };

            constructor(singletonEnforcer:()=>void) {
                if (singletonEnforcer !== SingletonEnforcer) {
                    throw new Error("Error: Instantiation failed: Use Singleton.getInstance() instead of new.");
                }
            }

            public static getInstance() {
                let helper = this; // this === Helper.
                if (helper._instance == null) {
                    helper._instance = dj.create(Helper, SingletonEnforcer);
                }
                return helper._instance;
            }

            public getQueryString(query:string) {
                if (typeof query === 'string' && query !== '') {
                    let idxStart = query.indexOf('?');
                    if (idxStart != -1) {
                        idxStart = idxStart + 1;
                        let idxEnd = query.indexOf('#');
                        idxEnd = (idxEnd == -1 ? query.length : idxEnd);
                        query = query.substring(idxStart, idxEnd);
                        if (query !== '') {
                            let tmpArr:string[] = query.split('&');
                            for (let i = 0; i < tmpArr.length; i++) {
                                query = tmpArr[i];
                                if (query != '') {
                                    let tmpVal = query.split('=');
                                    this.queryString.set(tmpVal[0], decodeURI((tmpVal[1] ? tmpVal[1] : '')));
                                }
                            }
                        }
                    }
                }
                return this.queryString;
            }

        }

        // Add class: [ Helper ]
        dj.add('Helper', Helper);
    });
}
