import React, { useContext } from "react";
import { Icon } from "component/icon";
import { Context as NetworkContext } from "root/network-adapter";
import styles from "./index.module.scss";
import { isNotNullArray } from "utils/c";

/**
 * @typedef TTreeItemArgs
 * @property {string} title 标题
 * @property {boolean} active 当前选中
 * @property {boolean} editing 编辑模式
 * @property {function} onTitleChange 编辑模式：标题变化
 */
/**
 * @param {TTreeItemArgs} props
 */
function TreeItem(props) {
    const $title = props.editing ? <label>
        <input />
    </label> : <>
        <span className={styles.treeItem_item_title}>{props.title}</span>
    </>;
    const itemStyle = { "--LEVEL": props.level * 1 || 0 };
    const iconName = props.active ? "#folder-open" : "#folder";
    return <div style={itemStyle}>
        <div className={styles.treeItem_item}>
            <Icon name={iconName} className={styles.treeItem_item_icon} />
            {$title}
        </div>
        {props.children}
    </div>;
}

/**
 * 渲染文件夹树
 * @param {array} list
 */
function listRender(list, level=0) {
    return isNotNullArray(list) && list.reduce((prev, curr) => {
        if (!curr.size) {
            const subs = isNotNullArray(curr.children) && listRender(curr.children, level + 1);
            const attr = {
                key:    curr.path,
                title:  curr.name,
                level
            };
            prev.push(<TreeItem {...attr}>{subs}</TreeItem>);
        }
        return prev;
    }, []);
}

export default function TreeBody() {
    const { data } = useContext(NetworkContext);

    return <div className={styles.body}>
        <TreeItem title="/"/>
        {listRender(data.arr)}
    </div>
}
