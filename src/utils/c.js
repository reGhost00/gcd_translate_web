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
