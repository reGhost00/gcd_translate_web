import React, { useContext, useEffect, useMemo, useState } from "react";
import { Icon, IconBar } from "component/icon";
import { TreeItem } from "./tree-item";
import InputWithMessage from "component/input-with-message";
import { VirtualList } from "component/virtual-list";

import { NetworkAdapterContext } from "root/data-adapter";
import { IndexContext } from "root";

import { hofFormBindValue, hookGetState, hookSetState } from "utils/r";
import { classNamesGenerator, deepFreeze, hofCallContinue, hofCallWithCondition, hofDOMClassFilter, hofGetDOMValue, isNotNullArray } from "utils/c";

import styles from "./index.module.scss";


/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */
/** @typedef {import("component/icon").TIconArgs} TIconArgs */
/**
 * 渲染用节点
 * @typedef TTreeRenderItem
 * @property {string} path
 * @property {string} name
 * @property {number} level
 */
const DEF = deepFreeze({
    rootActions: [
        { name: "#folder-plus", title: "新建文件夹", className: `${styles.actionGroup_icon} create`, nodeName: "button" },
        { name: "#folder-arrow-down", title: "下载", className: `${styles.actionGroup_icon} download`, nodeName: "button" }
    ],
    itemActions: [
        { name: "#pen-to-square", title: "重命名", className: `${styles.actionGroup_icon} rename`, nodeName: "button" },
        { name: "#folders", title: "移动", className: `${styles.actionGroup_icon} move`, nodeName: "button" },
        { name: "#folder-plus", title: "新建文件夹", className: `${styles.actionGroup_icon} create`, nodeName: "button" },
        { name: "#folder-arrow-down", title: "下载", className: `${styles.actionGroup_icon} download`, nodeName: "button" },
        { name: "#trash-can", title: "删除", className: `${styles.actionGroup_icon} delete`, nodeName: "button" }
    ],
    editingActions: [
        { name: "#check", title: "确定", className: `${styles.actionGroup_icon} submit`, nodeName: "button" },
        { name: "#xmark", title: "取消", className: `${styles.actionGroup_icon} cancel`, nodeName: "button" }
    ]
});

/**
 * @typedef TITEM_ACTION
 * @property {TIconArgs[]} root 根目录
 * @property {TIconArgs[]} item 普通目录
 * @property {TIconArgs[]} editingAction 重命名表单
 */
/**
 * @type {TITEM_ACTION} 点击按钮组
 */
const ITEM_ACTION = deepFreeze({
    root: [
        { name: "#folder-plus", title: "新建文件夹", className: `${styles.actionGroup_icon} create`, nodeName: "button" },
        { name: "#folder-arrow-down", title: "下载", className: `${styles.actionGroup_icon} download`, nodeName: "button" }
    ],
    item: [
        { name: "#pen-to-square", title: "重命名", className: `${styles.actionGroup_icon} rename`, nodeName: "button" },
        { name: "#folders", title: "移动", className: `${styles.actionGroup_icon} move`, nodeName: "button" },
        { name: "#folder-plus", title: "新建文件夹", className: `${styles.actionGroup_icon} create`, nodeName: "button" },
        { name: "#folder-arrow-down", title: "下载", className: `${styles.actionGroup_icon} download`, nodeName: "button" },
        { name: "#trash-can", title: "删除", className: `${styles.actionGroup_icon} delete`, nodeName: "button" }
    ]
});

const ITEM_HEIGHT = 35;

/**
 * @typedef TTreeBodyState
 * @property {string} editing 当前编辑路径
 * @property {string} create 当前新建路径
 * @property {string} folderName 新文件夹名
 */
/**
 * @typedef TTreeBodyFolder
 * @property {string} path
 * @property {string} name
 * @property {number} level
 * @property {number} $subFileLength
 */

export default function TreeBody() {
    const { data, loading, action: ctxAction } = useContext(NetworkAdapterContext);
    const { currFolder, action } = useContext(IndexContext);
    /** @type {[TTreeBodyState, React.Dispatch<React.SetStateAction<TTreeBodyState>>]} */
    const [state, setState] = useState({ editing: null, create: null, folderName: "" });
    /** @type {TTreeBodyFolder[]} 文件夹 */
    const folders = useMemo(() => {
        // let allPath = Object.values(data.kvs);
        /**
         * 树形数据转换为渲染用一维数组
         * @param {TTreeItem[]} list
         * @param {number} level
         */
        function getFolders(list, level = 0) {
            let res = [];
            if (isNotNullArray(list)) {
                for (const { path, name, children, size, $subFileLength } of list) {
                    if (!size) {
                        res.push({ path, name, level, $subFileLength });
                        if (isNotNullArray(children))
                            res = res.concat(getFolders(children, level+1));
                    }
                }
            }
            return res;
        }
        return [{ path: "/", name: "/", level: 0 }].concat(getFolders(data.arr));
    }, [data.arr, data.kvs]);

    const attr = {
        className: `${styles.list} ${loading.tree && "loading"}`,
        rowHeight: ITEM_HEIGHT,
        rowCount: folders.length,
        component: {
            inner: "ol",
            empty() {
                return <div className="empty_list_item">无数据</div>
            }
        },
        setRowKey(idx) {
            return folders[idx]?.path || idx;
        }
    };
    function setCurrFolder(folder) {
        const target = data.kvs?.[folder.path] || null;
        return target && action.setCurrFolder(target);
    }
    /**
     * 设置按钮组回调
     * @param {TTreeBodyFolder} folder
     */
    function getItemActions(folder) {
        const attr = {
            icons: "/" === folder.path ? ITEM_ACTION.root : ITEM_ACTION.item,
            className: styles.actionGroup,
            onClick: hofDOMClassFilter({
                rename() {
                    setState({ create: null, editing: folder.path, folderName: folder.name });
                    setCurrFolder(folder);
                },
                create() {
                    setState({ create: folder.path, editing: null, folderName: "" });
                    setCurrFolder(folder);
                },
                move(tar) {
                    console.log('move', tar)
                },
                download(tar) {
                    console.log('dl', tar)
                },
                delete(tar) {
                    console.log('del', tar)
                }
            })
        };
        return <IconBar {...attr} />
    }

    function treeItemRender({ index, scrolling, resizing }) {
        const folder = folders[index] || null;
        if (folder?.path && !folder.size) {
            const activeCSS = folder.path === currFolder?.path && "active";
            if (scrolling || resizing) {
                const attr = {
                    ...folder,
                    disabled: true,
                    className: activeCSS
                };
                return <TreeItem {...attr} />;
            }

            const attr = {
                ...folder,
                className: {
                    outer: activeCSS,
                    inner: styles.treeItem_inner,
                    title: "title",
                    [Symbol.toPrimitive]() {
                        return "";
                    }
                },
                creating: state.create === folder.path,
                editing: state.editing === folder.path,
                actions: getItemActions(folder),
                onClick() {
                    setCurrFolder(folder);
                },
                onSubmit(val) {
                    const parent = folder.path.split("/").slice(0, -2).join("/");
                    const newPath = `${parent}/${val}/`;
                    ctxAction.movePath(folder.path, newPath);
                    console.log("submit fffff", val);
                },
                onCancel() {
                    setState({ editing: null, create: null });
                }
            };
            return <TreeItem {...attr} />;
            // return <TreeItem {...attr.item} >
            //     {state.create === folder.path && <TreeItem {...attr.create} />}
            // </TreeItem>;
        }
        return null;
    }
    return <VirtualList {...attr}>
        {treeItemRender}
    </VirtualList>
}
