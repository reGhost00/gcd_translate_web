import React, { useContext, useState, useEffect } from "react";
import { Icon, IconBar } from "component/icon";
import { Context as DataContext } from "root/data-adapter";
import { deepFreeze, hofCallWithCondition, hofDOMClassFilter, hofGetDOMValue, isNotNullArray } from "utils/c";
import styles from "./index.module.scss";
import { hookGetState, hookSetState } from "utils/r";

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */

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

function TreeItemCreate(props) {
    const [value, setValue] = useState("");
    const attr = {
        input: {
            type: "text",
            value,
            placeholder: "请输入新文件夹名",
            onChange: hofGetDOMValue(setValue)
        },
        iconBar: {
            icons: DEF.editingActions,
            className: styles.actionGroup,
            onClick: hofDOMClassFilter({
                submit() {
                    props.onSubmit(value);
                },
                cancel: props.onCancel
            })
        }
    }
    return <div className={styles.treeItem_item_create}>
        <input {...attr.input}/>
        <IconBar {...attr.iconBar}/>
    </div>;
}

/**
 * @typedef TTreeItemArgs
 * @property {boolean} editing 编辑模式
 * @property {number} level 嵌套深度，用于样式
 * @property {React.ReactElement} actions 按钮组
 * @property {(p: string) => void} onClick 项点击
 * @property {(v: string) => void} onEditingSubmit
 * @property {() => void} onEditingCancel
 */
/**
 * @param {TTreeItemArgs & TTreeItem} props
 */
function TreeItem(props) {
    const { currFolder } = useContext(DataContext);
    const state = hookGetState({ folderName: '', message: null });
    const [editingValue, setEditingValue] = useState(props.name);
    useEffect(() => props.editing && setEditingValue(props.name), [props.editing]);
    const func = {
        onItemClick(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            props.onClick(props.path);
        },
        onEditingActionGroupClick: hofDOMClassFilter({
            submit() {
                props.onEditingSubmit(editingValue);
            },
            cancel: props.onEditingCancel
        })
    };
    const active = props.path && currFolder && props.path === currFolder.path;
    const iconName = active ? "#folder-open" : "#folder";
    const itemStyle = { "--LEVEL": props.level * 1 || 0 };
    const attr = {
        input: props.editing && {
            type:   "text",
            value:  state.folderName,
            placeholder: "请输入新文件夹名",
            onChange:hofGetDOMValue(function onFolderNameChange(folderName) {
                const message = /[\\/:*?"<>|]/.test(folderName) && `文件名不能包含下列任何字符\n\\ / : * ? " < > |`;
                if (message)
                    state.message = message;
                else
                    hookSetState(state, { folderName, message });
            })
        }
    };
    const $item = props.editing ? <div className={styles.treeItem_item_editing}>
        <Icon name={iconName} className={styles.treeItem_item_icon} />
        <label>
            <input {...attr.input} />
            {state.message && <div>{state.message}</div>}
        </label>
        <IconBar icons={DEF.editingActions} className={styles.actionGroup} onClick={func.onEditingActionGroupClick}/>
    </div> : <div className={`${styles.treeItem_item} ${active && "active"}`} onClick={func.onItemClick}>
        <Icon name={iconName} className={styles.treeItem_item_icon} />
        <span className={styles.treeItem_item_title} title={props.name}>{props.name}</span>
        {props.actions}
    </div>;
    return <div style={itemStyle}>
        {$item}
        {props.children}
    </div>;
}

/**
 * @typedef TTreeBodyState
 * @property {string} editing 当前编辑路径
 * @property {string} create 当前新建路径
 */

export default function TreeBody() {
    const { action, data } = useContext(DataContext);
    /** @type {TTreeBodyState} */
    const state = hookGetState({ editing: null, create: null, folderName: null });
    const func = {
        onActionGroupClick: hofCallWithCondition(function editingStatusGuard() {
            return !state.editing && !state.create;
        }, hofDOMClassFilter({
            rename() {
                action.setCurrFolder(this.path);
                state.editing = this.path;
            },
            move() {
                console.log('move', this)
            },
            create() {
                const path = this?.path || "/";
                action.setCurrFolder(path);
                state.create = path;
            },
            download() {
                console.log('dl', this);
            },
            delete() {
                console.log('delete', this);
            }
        })),
        onItemClick(path) {
            if (!state.editing && !state.create) {
                action.setCurrFolder(path || "/");
            }
        },
        onActionCancel() {
            hookSetState(state, { editing: null, create: null, folderName: null });
        },
        onEditingSubmit(newFolderName) {
            console.log('onEditingSubmit', this, newFolderName)
            func.onActionCancel();
        },
        onCreateSubmit(newFolderName = state.folderName) {
            console.log("onNewFolderSubmit", this, newFolderName)
            func.onActionCancel();
        }
    };
    const attrRootAction = {
        icons:      DEF.rootActions,
        className:  styles.actionGroup,
        "data-path":"/",
        onClick:    func.onActionGroupClick
    };
    const attrRootItem = {
        name: "/",
        path: "/",
        actions: <IconBar {...attrRootAction}/>,
        onClick: func.onItemClick
    }
    /**
     * 渲染文件夹树
     * @param {TTreeItem[]} list
     */
    function treeRender(list, level=0) {
        return isNotNullArray(list) && list.reduce((prev, curr) => {
            if (!curr.size) {
                const editing = state.editing && state.editing === curr.path;
                const attrAction = !editing && {
                    icons:      DEF.itemActions,
                    className:  styles.actionGroup,
                    onClick:    func.onActionGroupClick.bind(curr)
                };
                const attrItem = Object.assign({
                    level,
                    editing,
                    key:            curr.path,
                    actions:        !editing && <IconBar {...attrAction}/>,
                    onClick:        func.onItemClick,
                    onEditingCancel:func.onActionCancel,
                    onEditingSubmit:func.onEditingSubmit.bind(curr)
                }, curr);
                const subs = isNotNullArray(curr.children) && treeRender(curr.children, level + 1);
                const children = [curr.path === state.create && <TreeItemCreate onSubmit={func.onCreateSubmit.bind(curr)} onCancel={func.onActionCancel} />].concat(subs || []);
                prev.push(<TreeItem {...attrItem}>{children}</TreeItem>);
            }
            return prev;
        }, []);
    }
    return <div className={`${styles.body} ${(state.create || state.editing) && "disabled"}`}>
        <TreeItem {...attrRootItem}>
            {"/" === state.create && <TreeItemCreate onSubmit={func.onCreateSubmit} onCancel={func.onActionCancel}/> }
        </TreeItem>
        {treeRender(data?.arr)}
    </div>
}
