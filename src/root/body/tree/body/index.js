import React, { useContext } from "react";
import { Icon } from "component/icon";
import { Context as DataContext } from "root/data-adapter";
import { isNotNullArray } from "utils/c";
import styles from "./index.module.scss";

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */
/**
 * @typedef TTreeItemArgs
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
    const active = props?.path === currFolder?.path || Number.NaN;
    const iconName = active ? "#folder-open" : "#folder";
    const itemStyle = { "--LEVEL": props.level * 1 || 0 };
    const $title = <span className={styles.treeItem_item_title}>{props.name}</span>;
    return <div style={itemStyle}>
        <div className={`${styles.treeItem_item} ${active && "active"}`} onClick={onItemClick}>
            <Icon name={iconName} className={styles.treeItem_item_icon} />
            {$title}
        </div>
        {props.children}
    </div>;
}

/**
 * 渲染文件夹树
 * @param {TTreeItem[]} list
 */
function listRender(list, level=0) {
    return isNotNullArray(list) && list.reduce((prev, curr) => {
        if (!curr.size) {
            const subs = isNotNullArray(curr.children) && listRender(curr.children, level + 1);
            const attr = Object.assign({
                level,
                key:    curr.path
            }, curr);
            prev.push(<TreeItem {...attr}>{subs}</TreeItem>);
        }
        return prev;
    }, []);
}

export default function TreeBody() {
    const { data } = useContext(DataContext);
    
    return <div className={styles.body}>
        <TreeItem name="/" path="/"/>
        {listRender(data?.arr)}
    </div>
}
