import React, { useRef, useEffect, useMemo, useState } from "react";
import { Icon, IconBar } from "component/icon";

import Tooltip from "component/grid-tooltip";

import { hofFormBindValue, hookGetState, hookSetState } from "utils/r";
import { classNamesGenerator, deepFreeze, hofCallContinue, hofCallWithCondition, hofDOMClassFilter, hofGetDOMValue, isNotNullArray } from "utils/c";

import styles from "./index.module.scss";

const TOOLTIP_CONFIG = Object.freeze({
    name: "名称",
    path: "路径",
    $subFileLength: "子文件数"
});

const ITEM_ACTION = Object.freeze([
    { name: "#check", className: `${styles.actionGroup_icon} submit`, nodeName: "button" },
    { name: "#xmark", className: `${styles.actionGroup_icon} cancel`, nodeName: "button" }
]);
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
export function TreeItem(props) {
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
        ? <Tooltip fixed className={`${styles.treeItem_title} ${props.className?.title}`} data={props} config={TOOLTIP_CONFIG}>
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
        {props.children}
    </li>
}

export function TreeItemCreate(props) {
    const [value, setValue] = useState("");
    const ref = useRef(null);
    const attrInput = {
        ref,
        placeholder: "请输入文件夹名",
        pattern: '[^\\/:*?"<>|]+',
        value,
        onChange: hofGetDOMValue(setValue)
    };
    const attrActionGroup = {
        icons: ITEM_ACTION,
        onClick: hofDOMClassFilter({
            submit() {
                if (value) {
                    if (!/[\\/:*?"<>|]/.test(value)) {
                        return props.onSubmit(value);
                    }
                    alert(`文件名不能包含以下字符\n\\ / : * ? " < > |`);
                }
            },
            cancel: props.onCancel
        })
    };

    return <div className={styles.treeItem_create}>
        <label>
            <input {...attrInput} />
            <IconBar {...attrActionGroup}/>
        </label>
    </div>;
}
