import React, { useContext, useState, useEffect } from "react";
import { Icon, IconBar } from "component/icon";
import { Context as DataContext } from "root/data-adapter";
import { deepFreeze, hofCallWithCondition, hofDOMClassFilter, hofGetDOMValue, isNotNullArray } from "utils/c";
import styles from "./index.module.scss";

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */

const DEF = deepFreeze({
    itemActions: [
        { name: "#pen-to-square", title: "重命名", className: `${styles.actionGroup_icon} rename`, nodeName: "button" },
        { name: "#folders", title: "移动", className: `${styles.actionGroup_icon} move`, nodeName: "button" },
        { name: "#folder-arrow-down", title: "下载", className: `${styles.actionGroup_icon} download`, nodeName: "button" },
        { name: "#trash-can", title: "删除", className: `${styles.actionGroup_icon} delete`, nodeName: "button" }
    ],
    editingActions: [
        { name: "#check", title: "确定", className: `${styles.actionGroup_icon} submit`, nodeName: "button" },
        { name: "#xmark", title: "取消", className: `${styles.actionGroup_icon} cancel`, nodeName: "button" }
    ]
});

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
    const $item = props.editing ? <div className={styles.treeItem_item_editing}>
        <Icon name={iconName} className={styles.treeItem_item_icon} />
        <input value={editingValue} onChange={hofGetDOMValue(setEditingValue)} />
        <IconBar icons={DEF.editingActions} className={styles.actionGroup} onClick={func.onEditingActionGroupClick}/>
    </div> : <div className={`${styles.treeItem_item} ${active && "active"}`} onClick={func.onItemClick}>
        <Icon name={iconName} className={styles.treeItem_item_icon} />
        <span className={styles.treeItem_item_title}>{props.name}</span>
        {props.actions}
    </div>;
    return <div style={itemStyle}>
        {$item}
        {props.children}
    </div>;
}

export default function TreeBody() {
    const { action, data } = useContext(DataContext);
    const [editingFolder, setEditingFolder] = useState("");
    const func = {
        onActionGroupClick: hofCallWithCondition(function editingStatusGuard() {
            return !editingFolder;
        }, hofDOMClassFilter({
            rename($tar) {
                const path = this.path || $tar.dataset.path;
                action.setCurrFolder(path);
                setEditingFolder(path);
            },
            move() {
                console.log('move', this)
            },
            download() {
                console.log('dl', this);
            },
            delete() {
                console.log('delete', this);
            }
        })),
        onItemClick(path) {
            if (!editingFolder) {
                action.setCurrFolder(this.path || path);
            }
        },
        onEditingCancel() {
            setEditingFolder(null);
        },
        onEditingSubmit(newFolderName) {
            console.log('onEditingSubmit', this, newFolderName)
            func.onEditingCancel();
        }
    };
    /**
     * 渲染文件夹树
     * @param {TTreeItem[]} list
     */
    function treeRender(list, level=0) {
        return isNotNullArray(list) && list.reduce((prev, curr) => {
            if (!curr.size) {
                const subs = isNotNullArray(curr.children) && treeRender(curr.children, level + 1);
                const editing = editingFolder && editingFolder === curr.path;
                const attrAction = !editing && {
                    icons:      DEF.itemActions,
                    className:  styles.actionGroup,
                    "data-path":curr.path,
                    onClick:    func.onActionGroupClick.bind(curr)
                };
                const attrItem = Object.assign({
                    level,
                    editing,
                    key:            curr.path,
                    actions:        !editing && <IconBar {...attrAction}/>,
                    onClick:        func.onItemClick.bind(curr),
                    onEditingCancel:func.onEditingCancel,
                    onEditingSubmit:func.onEditingSubmit.bind(curr)
                }, curr);
                prev.push(<TreeItem {...attrItem}>{subs}</TreeItem>);
            }
            return prev;
        }, []);
    }
    return <div className={styles.body}>
        <TreeItem name="/" path="/"/>
        {treeRender(data?.arr)}
    </div>
}
