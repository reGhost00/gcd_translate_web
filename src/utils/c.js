/** 项目特化 fetch 接收
 * @param {Promise} tar fetch 返回实例
 */
export async function fetchDataReceiver(tar) {
    const res = await tar;
    return res.ok ? res.json() : Promise.reject(res.statusText);
}

/** 异步异常捕捉 */
export async function noThrowWrap(tar) {
    try {
        const rev = await tar;
        return [null, rev];
    }
    catch(err) {
        return [err];
    }
}

export function isNotNullArray(arr) {
    return Array.isArray(arr) && arr.length > 0;
}

export function getReadableSize(size){
    const sizeKB = size / 1024;
    return  sizeKB > 1024
        ? `${Math.round(sizeKB / 1024 * 100) / 100}MB`
        : `${Math.round(sizeKB * 100) / 100}KB`;
}


function cancelDefault(ev){
    if("function" === typeof ev.stopPropagation){
        ev.stopPropagation();
        ev.preventDefault();
    }
}

export function hofDOMClassFilter(...args) {
    if ("function" === typeof args[1] && "string" === typeof args[0] && args[0]) {
        const [cn, fn] = args;
        return function domClassFilterWrap(ev, ...rest) {
            const $tar = ev instanceof HTMLElement ? ev : ev.target;
            if ($tar instanceof HTMLElement && $tar.classList.contains(cn)) {
                cancelDefault(ev);
                return fn.apply(this || null, [$tar, ev, ...rest]);
            }
        };
    }
    else if ("[object Object]" === Object.prototype.toString.call(args[0])) {
        const classes = Object.keys(args[0]);
        return classes.length && function domClassesFilterWrap(ev, ...rest) {
            const $tar = ev instanceof HTMLElement ? ev : ev.target;
            if ($tar instanceof HTMLElement) {
                for (const css of classes) {
                    if ($tar.classList.contains(css)) {
                        cancelDefault(ev);
                        return "function" === typeof args[0][css] && args[0][css].apply(this || null, [$tar, ev, ...rest]);
                    }
                }
            }
        };
    }
}

export function hofCallWithCondition(fnCondition, fnTarget) {
    return "function" === typeof fnCondition && "function" === typeof fnTarget && function callWithConditionWrap(...args) {
        return fnCondition.apply(this, args) && fnTarget.apply(this, args);
    }
}

export function hofCallContinue(...fns) {
    return function callContinueWrap(...args) {
        return fns.reduce((prev, fn) => [fn.apply(this, prev), ...prev], args);
    };
}

export function hofGetDOMValue(fn) {
    return "function" === typeof fn && function getDOMValueWrap(ev) {
        const $ = ev.target instanceof HTMLElement ? ev.target : ev;
        return $ instanceof HTMLElement && fn.call(ev || null, $.value);
    }
}
// /**
//  * 数据转对象
//  * 下标 > 索引
//  * @param {*} key
//  * @param {*} arr
//  */
// export function arrKVMapReducer(key, arr) {
//     if (key && Array.isArray(arr)) {
//         const rev = {

//             *[Symbol.iterator]() {

//             }
//         };
//     }
// }
export function deepFreeze(obj) {
    if (typeof obj === "object" && obj) {
        let prop = null;
        Object.getOwnPropertyNames(obj).forEach(name => {
            prop = obj[name];
            if (typeof prop === "object" && prop)
                deepFreeze(prop);
        });
        return Object.freeze(obj);
    } else
        return obj;
}

/**
 * 生成className
 * @param  {...(string | { [name: string]: boolean })} classNames
 * @returns {string}
 */
export function classNamesGenerator(...classNames) {
    const res = [];
    for (const val of classNames) {
        if ("string" === typeof val && val)
            res.push(val);
        else if ("[object Object]" === Object.prototype.toString.call(val)) {
            for (const key in val) {
                if (val[key])
                    res.push(key);
            }
        }
    }
    return res.join(" ");
}

/**
 * 获取固定长度数组
 * @template T
 * @template {{ length: number, push(v: T): R, [i: number]: T }} R
 * @param {number} len
 * @param  {...T} args
 * @returns {R}
 */
export function getFixArray(len, ...args) {
    const tar = Object.defineProperties(Object.create(null), {
        length: {
            value: len * 1,
            enumerable: true
        },
        push: {
            enumerable: true,
            value(v) {
                for (let i = this.length; i; i--) {
                    this[i - 1] = this[i - 2];
                }
                this[0] = v;
                return this;
            }
        },
        [Symbol.iterator]: {
            enumerable: true,
            *value() {
                for (let i = 0; i < this.length; i++) {
                    yield this[i];
                }
            }
        }
    });

    if (Number.isNaN(tar.length) || tar.length <= 0) {
      throw new Error('getFixArray() 参数错误');
    }
    for (let i = 0; i < tar.length; i++) {
      tar[i] = args[i];
    }
    return Object.seal(tar);
}

/**
 * 绑定this
 * @template T, R
 * @template {unknown[]} A
 * @template {{ [name: string]: (this: T, ...args: A) => R }} FNS
 * @param {T} host
 * @param {FNS} fnKVs
 * @returns {FNS}
 */
export function functionBindThisObject(host, fnKVs) {
    if (Object.prototype.toString.call(host) === '[object Object]' && Object.prototype.toString.call(fnKVs) === '[object Object]') {
        const fns = Object.keys(fnKVs);
        for (const fn of fns) {
            if (typeof fnKVs[fn] === 'function') {
                fnKVs[fn] = fnKVs[fn].bind(host);
            }
        }
      return fnKVs;
    }
    throw new Error('functionBindThisObject() 参数错误');
}

export const MathEx = {
    /**
     * 正态分布
     * @param {number} avg μ 平均值
     * @param {number} std σ 标准差
     * @return {number} N(μ, σ^2)
     * */
    normalDistribution(avg, std) {
        // box-muller polar
        // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
        return avg + std * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    },
    /** 正态分布 + 范围采样
     * @param {number} avg μ 平均值
     * @param {number} std σ 标准差
     * @param {number} offset 允许偏移值
     * @return {number} N(μ, σ^2) ∈ (μ - offset, μ + offset)
    */
    normalDistributionWithRangeSample(avg, std, offset) {
        const min = avg - offset;
        const max = avg + offset;
        let val = MathEx.normalDistribution(avg, std);
        while (min > val || max < val) {
            val = MathEx.normalDistribution(avg, std);
        }
        return val;
    },
    /** 线性分布
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    uniformDistribution(min, max) {
        return Math.random() * (max - min) + min;
    },
    /** 累加
     * @param {...number} v
     * @return {number}
     */
    add(...v) {
        return v.reduce((p, c) => (p + c) * 1);
    },
    /** 累乘
     * @param {...number} v
     * @return {number}
     */
    times(...v) {
        return v.reduce((p, c) => p * c);
    }
};


/** @typedef {"POST" | "GET" | "PUT" | "DELETE"} TXHRMethod */
/**
 * XHR 额外参数
 * @typedef TXHROpt
 * @property {TXHRMethod} [method]
 * @property [header]
 * @property [body]
 * @property {EventTarget} [abortEventTarget] 用于取消请求 */
/** XHR封装
 * @param {string} url
 * @param {TXHROpt} [opt]
 */
export function xhr(url, opt) {
    if ("string" === typeof url && url) {
        return new Promise((resolve, reject) => {
            const { method = "GET", header = null, body = null, abortEventTarget = null } = opt || {};
            const hkvs = "[object Object]" === Object.prototype.toString.call(header) ? Object.entries(header) : [];
            const req = new XMLHttpRequest();
            req.open(method.toLocaleUpperCase(), url);
            req.responseType = "json";
            req.setRequestHeader("accept", "application/json, text/javascript, */*;");
            for (const [name, value] of hkvs)
                req.setRequestHeader(name, value);

            req.onerror = function onXHRError() {
                const { status, statusText, readyState } = req;
                reject({ status, statusText, readyState });
            }
            if (abortEventTarget instanceof EventTarget) {
                function abort() {
                    req.abort();
                    reject("ABORT");
                }
                abortEventTarget.addEventListener("ABORT", abort, { once: true });
                req.onload = function onXHRLoad() {
                    abortEventTarget.removeEventListener("ABORT", abort);
                    resolve(req.response);
                };
            }
            else {
                req.onload = function onXHRLoad() {
                    resolve(req.response);
                };
            }
            req.send(body);
        });
    }
}

/** get 打包
 * @param {string} url
 * @param {object} params
 */
xhr.get = function XHRGet(url, params) {
    if ("string" === typeof url && url) {
        const sp = "[object Object]" === Object.prototype.toString.call(params) && new URLSearchParams(params);
        const urlWithParams = sp ? `${url}${sp ? `?${sp}` : ""}` : url;
        return xhr(urlWithParams, { method: "GET", body: null, header: null });
    }
}
