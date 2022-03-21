import React, { useContext, useState } from "react";
import { Icon, IconBar } from "component/icon";
import { Context as DataContext } from "root/data-adapter";
import { isNotNullArray } from "utils/c";
import styles from "./index.module.scss";

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */

const DEF = Object.freeze({
    actions: [
        { name: "#pen-to-square", title: "重命名", className: `${styles.actionGroup_icon} rename` },
        { name: "#folders", title: "移动", className: `${styles.actionGroup_icon} move` },
        { name: "#folder-arrow-down", title: "下载", className: `${styles.actionGroup_icon} download` },
        { name: "#trash-can", title: "删除", className: `${styles.actionGroup_icon} delete` }
    ]
});

/**
 * @typedef TTreeItemArgs
 * @property {React.ReactElement} actions 按钮组
 * @property {number} level 嵌套深度，用于样式
 */
/**
 * @param {TTreeItemArgs & TTreeItem} props
 */
function TreeItem(props) {
    const { action, currFolder } = useContext(DataContext);
    function onItemClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        action.setCurrFolder(props.path);
    }
    const active = props.path && currFolder && props.path === currFolder.path;
    const iconName = active ? "#folder-open" : "#folder";
    const itemStyle = { "--LEVEL": props.level * 1 || 0 };
    const $title = <span className={styles.treeItem_item_title}>{props.name}</span>;
    return <div style={itemStyle}>
        <div className={`${styles.treeItem_item} ${active && "active"}`} onClick={onItemClick}>
            <Icon name={iconName} className={styles.treeItem_item_icon} />
            {$title}
            {props.actions}
        </div>
        {props.children}
    </div>;
}

export default function TreeBody() {
    const { data } = useContext(DataContext);
    const [editingFolder, setEditingFolder] = useState("");

    /**
     * 渲染文件夹树
     * @param {TTreeItem[]} list
     */
    function treeRender(list, level=0) {
        return isNotNullArray(list) && list.reduce((prev, curr) => {
            if (!curr.size) {
                const subs = isNotNullArray(curr.children) && treeRender(curr.children, level + 1);
                const attr = Object.assign({
                    level,
                    key:    curr.path,
                    actions:<IconBar icons={DEF.actions} className={styles.actionGroup} />
                }, curr);
                prev.push(<TreeItem {...attr}>{subs}</TreeItem>);
            }
            return prev;
        }, []);
    }
    return <div className={styles.body}>
        <TreeItem name="/" path="/"/>
        {treeRender(data?.arr)}
    </div>
}
