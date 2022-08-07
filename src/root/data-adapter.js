import React, { useEffect, useRef } from "react";
import { message } from "component/dias";
import { noThrowWrap, isNotNullArray, xhr } from "utils/c";
import { hookGetState, hookSetState } from "utils/r";


/**
 * gcd 返回文件列表项
 * @typedef TOriginFileItem
 * @property {string} path 路径
 * @property {string} name 文件名
 * @property {number} size 文件大小
 */
/**
 * 网络请求 & 格式转换
 * @constructor
 * @param {EventTarget} abortEventTarget 用于取消请求
 */
function NetworkAdapter(abortEventTarget) {
    const SFN = Symbol("文件节点");
    const SF = Symbol("文件");
    /** @typedef {TOriginFileItem & { [SF]: TFileNode } } TFileItem 文件项 */
    /**
     * 原始文件树
     * @typedef {{ [p: string]: TFileItem[] }} TFileTree
     */

    /**
     * 文件链表节点
     * @typedef TFileNode
     * @property {TFileItem} $file 文件
     * @property {TFileNode} nextFile
     * @property {TFileNode} prevFile
     * @property {TFileNode} currFolder
     * @property {TFileNode} nextFolder
     * @property {TFileNode} prevFolder
     * @property {string} SFN
     */
    /**
     * 链表节点组
     * @typedef TFileNodeGroup
     * @property {TFileNode[]} arr 节点数组
     * @property {TFileNode} head 头节点
     * @property {TFileNode} tail 尾节点
     */
    /** 链表转换函数
     * @param {TFileNodeGroup} resultFileNodes
     */
    function hofOriginFilesReducer(resultFileNodes) {
        const folderHeadKVs = {};
        let currFile = Object.assign(resultFileNodes.head, { [SFN]: "FILE" });
        let prevFile = null;
        // let currFolder = { [SFN]: "FOLDER" };
        // let prevFolder = null;
        // let prevFolderPath = '';

        const folderTree = {};
        function getCurrFolder($file) {
            const path = $file.path.split("/").slice(1, -1);
            let currFolder = folderTree;
            for (const p of path) {
                currFolder = currFolder[p] || Object.assign(currFolder, { [p]: { parent: currFolder } })[p];
            }
            // const ps = !$file.size ? $file.path.slice(1).join("/")
            // let currFolder = folderTree;
            // let parentFolder = null;
            // for (const p of ps) {
            //     currFolder = currFolder[p] || Object.assign(currFolder, { [p]: { parentFolder } })[p];
            //     parentFolder = currFolder.parentFolder;
            // }
            // console.log(path, currFolder, parentFolder)
        }



        /** 链表转换
         * @param {TOriginFileItem} $file 文件项
         */
        return function originFilesReducerWrap($file) {
            // console.log('f', path, item)
            // const folder = path.split("/").slice(0, -1).join("/");
            // const currFolder = folderHeadKVs[folder] || Object.assign(currFile, { [SFN]: "FOLDER" });
            getCurrFolder($file);
            console.log('folderTree', folderTree)
            prevFile = Object.assign(currFile, { $file, prevFile, nextFile: {} });
            currFile = Object.assign(prevFile.nextFile, { [SFN]: "FILE", prevFile });
            return $file;
        };
    }

    /**
     * 返回链表修饰函数
     * @param {TFileNodeGroup} resultFileNode
     */
    function hofOriginFileModifierGenerator(resultFileNode) {
        /**
         * @typedef TNodeTree
         * @property {string} name 文件夹名
         * @property {TFileNodeGroup} files
         * @property {TNodeTree} sub
         */
        /** @type {{ [path: string]: TFileNodeGroup }} 节点树 */
        const nodeTree = {};
        let currFile = Object.assign(resultFileNode.head, { [SFN]: "FILE" });
        let prevFile = null;
        return {
            fileModifier($file) {

                // prevFile = Object.assign(currFile, { $file, prevFile, nextFile: {} });
                // currFile = Object.assign(prevFile.nextFile, { [SFN]: "FILE", prevFile });
                return $file;
            },
            pathModifier(path, files) {
                return { [path]: files };
            }
        }
    }

    /** 递归请求指定目录下的全部文件
     * @param {string} path 路径
     * @param {ReturnType<typeof hofOriginFileModifierGenerator>} modifier 修饰函数
     * @param {TFileTree} [op] 返回数据
     * @return {Promise<TFileTree>}
     */
    async function getOriginFiles(path, modifier, op = {}) {
        const { fileModifier, pathModifier } = modifier;
        /** @type {[any, TOriginFileItem[]]} */
        const [err, rev] = await noThrowWrap(xhr(`/list?path=${path}`, { abortEventTarget }));
        const Nodes = { head: null, tail: null, arr: null };
        const files = [];
        if (!err && isNotNullArray(rev)) {
            for (const item of rev) {
                if (!item.size)
                    op = await getOriginFiles(item.path, modifier, op);
                else
                    files.push(fileModifier(item));
            }
        }
        return Object.assign(op, pathModifier(path, files));
    }
    /** 请求指定路径的文件
     * @param {string} [path] 路径
     */
    this.getFiles = async function getFiles(path = "/") {
        const fileNodes = { arr: [], head: {}, tail: null };
        const fileTree = await getOriginFiles(path, hofOriginFileModifierGenerator(fileNodes));
        console.log('getFiles', fileTree, fileNodes)
    };
};

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
        const [err, rev] = await noThrowWrap(xhr(`/list?path=${path}`));
        if (err)
            message.error(`请求列表失败 ${err}`);
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
 * @typedef TDataAdapterStateLoading
 * @property {string} tree 读取文件树
 * @property {string} file 上传/下载文件
 */
/**
 * 文件
 * @typedef TDataAdapterStateData
 * @property {TTreeItem[]} arr
 * @property {{ length: number, [K: string]: TTreeItem }} kvs
 */
/**
 * DataAdapter 状态
 * @typedef TDataAdapterState
 * @property {TDataAdapterStateLoading} loading
 * @property {TDataAdapterStateData} data
 * @property {TTreeItem} currFolder
 */
/**
 * @typedef TContextAction
 * @property
 */

/** @type {React.Context<TDataAdapterState>} */
export const Context = React.createContext({});

export function DataAdapter({ children }) {
    const refs = {
        /** @type {React.MutableRefObject<EventTarget>} */
        ev: useRef(null),
        /** @type {React.MutableRefObject<NetworkAdapter>} */
        adapter: useRef(null)
    };

    useEffect(() => {
        refs.ev.current = new EventTarget();
        refs.adapter.current = new NetworkAdapter(refs.ev.current);
        refs.adapter.current.getFiles();

    }, []);

    /** @type {TDataAdapterState} */

    const state = hookGetState({ loading: null, data: null, currFolder: null });
    useEffect(() => {
        state.loading = { tree: "/", path: "" };
        comm.getFileTree().then(data => {
            const newState = {
                loading: { tree: "", path: "" },
                currFolder: { name: "/", path: "/", children: data.arr },
                data
            }
            newState.data.kvs["/"] = newState.currFolder;
            hookSetState(state, newState);
        });
    }, []);

    const action = {
        /**
         * 切换当前目录
         * @param {string} newFolderPath
         */
        setCurrFolder(newFolderPath) {
            const kvs = state.data?.kvs || {};
            state.currFolder = kvs[newFolderPath] || null;
        }
    };
    const value = {
        action,
        ...state
    }

    return <Context.Provider value={value}>
        {children}
    </Context.Provider>;
}
