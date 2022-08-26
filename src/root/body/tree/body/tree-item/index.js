import React, { useContext, useEffect, useMemo } from "react";
import { Icon, IconBar } from "component/icon";

import Tooltip from "component/grid-tooltip";
import styles from "./index.module.scss";

const TOOLTIP_CONFIG = Object.freeze({
    name: "名称",
    path: "路径",
    $subFileLength: "子文件数"
});
/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */
/**
 * @typedef TFolderItem
 * @property {string} path 路径
 * @property {string} name 文件夹名
 * @property {number} level 嵌套层
 */
/**
 * @typedef TTreeItemArgsClassName
 * @property {string} outer 外部容器
 * @property {string} inner 内部容器
 * @property {string} title
 */
/**
 * @typedef TTreeItemArgs
 * @property {string} path
 * @property {string} name
 * @property {number} level 嵌套深度，用于样式
 * @property {number} $subFileLength
 * @property {boolean} disabled 滚动或调整大小过程
 * @property {React.ReactElement} actions 按钮组
 * @property {string | TTreeItemArgsClassName} className
 * @property {(p: string) => void} onClick 项点击
//  * @property {(v: string) => void} onEditingSubmit
//  * @property {() => void} onEditingCancel
 */
/**
 * @param {TTreeItemArgs} props
 */
export default function TreeItem(props) {
    const treeItemCSS = `${styles.treeItem} ${props.className?.outer || props.className}`;
    const levelStyle = { "--level": props.level };
    if (props.disabled) {
        return <li className={`${treeItemCSS} disabled`} style={levelStyle}>
            <div className={`${styles.treeItem_container} ${props.className?.inner}`}>
                <Icon name="#folder" className={`${styles.treeItem_icon} close`} />
                <Icon name="#folder-open" className={`${styles.treeItem_icon} open`} />
                <span className={styles.treeItem_title}>{props.name}</span>
            </div>
        </li>
    }
    const $name = "string" === typeof props.name
        ? <Tooltip className={`${styles.treeItem_title} ${props.className?.title}`} data={props} config={TOOLTIP_CONFIG}>
            {props.name}
        </Tooltip>
        : props.name;
    return <li className={treeItemCSS} style={levelStyle}>
        <div className={`${styles.treeItem_container} ${props.className?.inner}`} onClick={props.onClick}>
            <Icon name="#folder" className={`${styles.treeItem_icon} close`} />
            <Icon name="#folder-open" className={`${styles.treeItem_icon} open`} />
            {$name}
            {props.actions}
        </div>
    </li>
}
