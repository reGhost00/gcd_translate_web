import React, { useEffect } from "react";
import { message } from "component/dias";
import { noThrowWrap, fetchDataReceiver, isNotNullArray } from "utils/c";
import { hookGetState, hookSetState } from "utils/r";

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
const network = {
    /** 获取文件列表
     * @param {string} path 路径
     * @returns {TGCDFileItem[]}
     */
    async getFileList(path="/") {
        /** @type {[null | Error, TGCDFileItem[]]} */
        const [err, rev] = await noThrowWrap(fetchDataReceiver(fetch(`/list?path=${path}`)));
        if (err)
            message(`请求列表失败 ${err}`);
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

/**
 * 请求状态
 * @typedef TNetworkAdapterStateLoading
 * @property {string} tree 读取文件树
 * @property {string} file 上传/下载文件
 */
/**
 * 文件
 * @typedef TNetworkAdapterStateData
 * @property {TTreeItem[]} arr
 * @property {{ length: number, [K: string]: TTreeItem }} kvs
 */
/**
 * NetworkAdapter 状态
 * @typedef TNetworkAdapterState
 * @property {TNetworkAdapterStateLoading} loading
 * @property {TNetworkAdapterStateData} data
 */

/** @type {React.Context<TNetworkAdapterState>} */
export const Context = React.createContext({});

export function NetworkAdapter({ children }) {
    /** @type {TNetworkAdapterState} */
    const state = hookGetState({ loading: null, data: null });
    useEffect(() => {
        state.loading = { tree: '/', path: '' };
        comm.getFileTree().then(data => {
            hookSetState(state, { loading: { tree: '', path: '' }, data })
        });
    }, []);

    const value = { loading: state.loading || {}, data: state.data || {} };
    return <Context.Provider value={value}>
        {children}
    </Context.Provider>;
}
