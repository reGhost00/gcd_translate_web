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
