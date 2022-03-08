import React, { useEffect } from "react";
import { noThrowWrap, fetchDataReceiver, isNotNullArray } from "utils/c";

/**
 * gcd 返回文件列表项
 * @typedef TGCDFileItem
 * @property {string} path 路径
 * @property {string} name 文件名
 * @property {number} size 文件大小
 */
/**
 * 文件树节点
 * @typedef TTreeItem
 * @property {string} path 路径
 * @property {string} name 文件名
 * @property {number} size 文件大小
 * @property {TTreeItem[]} children 子目录
 */
/**
 * 文件项索引
 * @typedef TFileKVs
 * 
 */

export const Context = React.createContext({});

const network = {
    /** 获取文件列表
     * @param {string} path 路径
     * @returns {TGCDFileItem[]}
     */
    async getFileList(path="/") {
        /** @type {[null | Error, TGCDFileItem[]]} */
        const [err, rev] = await noThrowWrap(fetchDataReceiver(fetch(`/list?path=${path}`)));
        if (err)
            alert(`请求列表失败 ${err}`);
        // else if (Array.isArray(rev)) {
        //     for (const item of rev) {
        //         if (!item.size)
        //             item.children = await network.getFileTree(item.path);
        //     }
        // }
        return rev || null;
    }
};

const comm = {
    /**
     * 获取文件树 & 路径索引
     * @param {string} path 路径
     * @param {*} [kvs] 路径索引
     * @returns
     */
    async getFileTree(path="/", kvs={ length: 0 }) {
        const arr = await network.getFileList(path) || null;
        const rev = { arr, kvs };
        if (isNotNullArray(arr)) {
            rev.kvs.length += arr.length;
            for (const item of arr) {
                kvs[item.path] = item;
                if (!item.size) {
                    const sub = await comm.getFileTree(item.path, kvs);
                    item.children = sub.arr || null;
                    rev.kvs = Object.assign(kvs, sub.kvs);
                }
            }
        }
        return rev;
    }
}

export function NetworkAdapter({ children }) {
    useEffect(() => {
        comm.getFileTree().then(rev => {
            console.log('lis', rev)
        })
    }, []);
    const value = {};
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
