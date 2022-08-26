import React, { useContext, useEffect, useMemo } from "react";
import { Icon, IconBar } from "component/icon";
import TreeItem from "./tree-item";
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

function TreeItemCreate(props) {
    const state = hookGetState({ value: '', message: '' });
    const attrInput = {
        message: state.message,
        type: "text",
        placeholder: "请输入新文件夹名",
        containerClassName: styles.treeItem_item_create,
        ...hofFormBindValue({ state, key: "value" }),
        onSubmit() {
            if (state.value) {
                if (!/[\\/:*?"<>|]/.test(state.value))
                    props.onSubmit(state.value);
                else
                    state.message = `文件名不能包含下列任何字符\n\\ / : * ? " < > |`;
            }
            else
                props.onCancel();
        }
    };
    const attrActionGroup = {
        icons: DEF.editingActions,
        className: styles.actionGroup,
        onClick: hofDOMClassFilter({
            submit: attrInput.onSubmit,
            cancel: props.onCancel
        })
    };

    return <InputWithMessage {...attrInput}><IconBar {...attrActionGroup}/></InputWithMessage>;
}

/**
 * @typedef TTreeItemArgs
 * @property {boolean} editing 编辑模式
 * @property {boolean} static 滚动或调整大小过程
 * @property {number} level 嵌套深度，用于样式
 * @property {React.ReactElement} actions 按钮组
 * @property {(p: string) => void} onClick 项点击
 * @property {(v: string) => void} onEditingSubmit
 * @property {() => void} onEditingCancel
 */
/**
 * @param {TTreeItemArgs & TTreeItem} props
 */
function TreeItem2(props) {
    const state = hookGetState({ folderName: '', message: null });
    useEffect(() => {
        state.folderName = props.editing ? props.name : "";
    }, [props.editing]);

    const itemStyle = { "--level": props.level * 1 || 0 };
    function onFolderNameSubmit() {
        if (state.folderName && state.folderName !== props.name && !/[\\/:*?"<>|]/.test(state.folderName))
            props.onEditingSubmit(state.folderName);
        else
            props.onEditingCancel();
    }
    const attr = {
        input: props.editing && {
            type:   "text",
            value:  state.folderName,
            placeholder: "请输入新文件夹名",
            containerClassName: styles.treeItem_item_input,
            message: state.message,
            messageType: "warn",
            onChange:hofGetDOMValue(function onFolderNameChange(folderName) {
                const message = /[\\/:*?"<>|]/.test(folderName) && `文件名不能包含下列任何字符\n\\ / : * ? " < > |`;
                if (message)
                    state.message = message;
                else
                    hookSetState(state, { folderName, message });
            }),
            onSubmit: onFolderNameSubmit
        },
        iconBar: props.editing && {
            icons: DEF.editingActions,
            className: styles.actionGroup,
            onClick: hofCallContinue(hofDOMClassFilter({
                submit: onFolderNameSubmit,
                cancel: props.onEditingCancel
            }), function resetState() {
                hookSetState(state, { folderName: '', message: null });
            })
        },
        item: !props.editing && {
            className: classNamesGenerator(styles.treeItem_item, props.className),
            onClick(ev){
                ev.preventDefault();
                ev.stopPropagation();
                props.onClick(props.path);
            }
        }
    };
    const $item = props.editing ? <div className={classNamesGenerator(styles.treeItem_item_editing, props.className)}>
        {/* <Icon name={iconName} className={styles.treeItem_item_icon} /> */}
        <InputWithMessage {...attr.input}>
            <IconBar {...attr.iconBar}/>
        </InputWithMessage>
    </div> : <div {...attr.item}>
        <Icon name="#folder" className={styles.treeItem_item_icon} />
        <Icon name="#folder-open" className={styles.treeItem_item_icon} />
        <span className={styles.treeItem_item_title} title={props.name}>{props.name}</span>
        {props.actions}
    </div>;
    return <li style={itemStyle}>
        {$item}
        {props.children}
    </li>;
}

/**
 * @typedef TTreeBodyState
 * @property {string} editing 当前编辑路径
 * @property {string} create 当前新建路径
 */
/**
 * @typedef TTreeBodyFolder
 * @property {string} path
 * @property {string} name
 * @property {number} level
 * @property {number} $subFileLength
 */

export default function TreeBody() {
    const { data, loading } = useContext(NetworkAdapterContext);
    const { currFolder, action } = useContext(IndexContext);
    /** @type {TTreeBodyState} */
    const state = hookGetState({ editing: null, create: null, folderName: null });
    // const func = {
    //     onActionGroupClick: hofCallWithCondition(function editingStatusGuard() {
    //         return !state.editing && !state.create;
    //     }, hofDOMClassFilter({
    //         rename() {
    //             // action.setCurrFolder(this.path);
    //             state.editing = this.path;
    //         },
    //         move() {
    //             console.log('move', this)
    //         },
    //         create() {
    //             const path = this?.path || "/";
    //             // action.setCurrFolder(path);
    //             state.create = path;
    //         },
    //         download() {
    //             console.log('dl', this);
    //         },
    //         delete() {
    //             console.log('delete', this);
    //         }
    //     })),
    //     onItemClick(path) {
    //         if (!state.editing && !state.create) {
    //             // action.setCurrFolder(path || "/");
    //         }
    //     },
    //     onActionCancel() {
    //         hookSetState(state, { editing: null, create: null, folderName: null });
    //     },
    //     onEditingSubmit(newFolderName) {
    //         console.log('onEditingSubmit', this, newFolderName)
    //         func.onActionCancel();
    //     },
    //     onCreateSubmit(newFolderName = state.folderName) {
    //         console.log("onNewFolderSubmit", this, newFolderName)
    //         func.onActionCancel();
    //     }
    // };
    // const attrAction = {
    //     icons:      DEF.rootActions,
    //     className:  styles.actionGroup,
    //     "data-path":"/",
    //     onClick:    func.onActionGroupClick
    // };
    // const attrItem = {
    //     name: "/",
    //     path: "/",
    //     actions: <IconBar {...attrAction}/>,
    //     onClick: func.onItemClick
    // // }
    // /**
    //  * 渲染文件夹树
    //  * @param {TTreeItem[]} list
    //  */
    // function treeRender(list, level=0) {
    //     return isNotNullArray(list) && list.reduce((prev, curr) => {
    //         if (!curr.size) {
    //             const creating = curr.path === state.create;
    //             const editing = state.editing && curr.path === state.editing;
    //             const attrAction = !editing && {
    //                 icons:      DEF.itemActions,
    //                 className:  styles.actionGroup,
    //                 onClick:    func.onActionGroupClick.bind(curr)
    //             };
    //             const attr = {
    //                 item: Object.assign({
    //                     level,
    //                     editing,
    //                     key:            curr.path,
    //                     actions:        !editing && <IconBar {...attrAction}/>,
    //                     onClick:        func.onItemClick,
    //                     onEditingCancel:func.onActionCancel,
    //                     onEditingSubmit:func.onEditingSubmit.bind(curr)
    //                 }, curr),
    //                 create: creating && Object.assign({

    //                 }, curr)
    //             }
    //             const subs = isNotNullArray(curr.children) && treeRender(curr.children, level + 1);
    //             const children = [creating && <TreeItemCreate key={`${curr.path}_create`} onSubmit={func.onCreateSubmit.bind(curr)} onCancel={func.onActionCancel} />].concat(subs || []);
    //             // prev.push(<li>{children}</li>)
    //             prev.push(<TreeItem {...attr.item}>{children}</TreeItem>);
    //         }
    //         return prev;
    //     }, []);
    // }
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

    const func = {
        onFolderClick(path) {
            const target = data.kvs?.[path] || null;
            return target && action.setCurrFolder(target);
        }
    };
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
    function getItemActions(folder) {
        const attr = {
            icons: "/" === folder.path ? ITEM_ACTION.root : ITEM_ACTION.item,
            className: styles.actionGroup
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
                actions: getItemActions(folder),
                onClick() {
                    const target = data.kvs?.[folder.path] || null;
                    return target && action.setCurrFolder(target);
                }
            };
            return <TreeItem {...attr} />;
        }
        return null;
    }
    return <VirtualList {...attr}>
        {treeItemRender}
    </VirtualList>
}
