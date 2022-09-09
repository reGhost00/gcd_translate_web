import React, { useRef, useEffect, useMemo, useState } from "react";
import { Icon, IconBar } from "component/icon";

import Tooltip from "component/grid-tooltip";

import { hofFormBindValue, hookGetState, hookSetState } from "utils/r";
import { classNamesGenerator, deepFreeze, hofCallContinue, hofCallWithCondition, hofDOMClassFilter, hofGetDOMValue, isNotNullArray } from "utils/c";

import styles from "./index.module.scss";

/**
 * @callback NormalDOMEventCallback
 * @param {React.SyntheticEvent} ev
 * @return {void}
 */
/**
 * dom 事件过滤回调
 * @callback NormalDOMWrapCallback
 * @param {HTMLElement} tar
 * @param {React.SyntheticEvent} ev
 * @return {void}
 */

/**
 * 通用冒泡父组件过滤
 * @param {string[]} nodeNames
 * @param {NormalDOMWrapCallback} cb
 * @return {NormalDOMEventCallback}
 */
function hofBubbleNodeNameFilter(nodeNames, cb) {
    return function bubbleFilterWrap(ev) {
        const tar = ev.target;
        if (nodeNames.includes(tar.nodeName))
            cb(tar, ev);
    }
}

const TOOLTIP_CONFIG = Object.freeze({
    name: "名称",
    path: "路径",
    $subFileLength: "子文件数"
});

const ITEM_ACTION = Object.freeze([
    { name: "#check", className: `${styles.actionGroup_icon} submit`, nodeName: "button" },
    { name: "#xmark", className: `${styles.actionGroup_icon} cancel`, nodeName: "button" }
]);
/**
 * 通用 input 回调
 * @callback NormalStringCallback
 * @param {string} value
 * @return {void}
 */
/**
 * 通用空函数
 * @callback NormalVoidCallback
 * @return {void}
 */

/**
 * @typedef TFormItemActionArgs
 * @property {string} value
 * @property {NormalStringCallback} onChange
 * @property {NormalVoidCallback} onCancel
 * @property {NormalVoidCallback} onSubmit
 */
/**
 * @param {TFormItemActionArgs} props
 */
function FormItemAction(props) {
    const attr = {
        input: {
            value: props.value,
            onChange: hofGetDOMValue(props.onChange)
        },
        action: {
            icons: ITEM_ACTION,
            onClick: hofDOMClassFilter({
                submit: props.onSubmit,
                cancel: props.onCancel
            })
        }
    };
    return <div className={styles.formItemAction}>
        <label>
            <input {...attr.input} />
            <IconBar {...attr.action}/>
        </label>
    </div>
}


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
 * @property {boolean} creating 创建模式
 * @property {boolean} editing 修改模式
 * @property {React.ReactElement} actions 按钮组
 * @property {string | TTreeItemArgsClassName} className
 * @property {NormalStringCallback} onClick 项点击
 * @property {NormalStringCallback} onChange
 * @property {NormalVoidCallback} onSubmit
 * @property {NormalVoidCallback} onCancel
 */
/**
 * @typedef TTreeItemState
 * @property {string} value
 * @property {boolean} invalid
 */
/**
 * @param {TTreeItemArgs} props
 */
export function TreeItem(props) {
    /** @type {[TTreeItemState, React.Dispatch<React.SetStateAction<TTreeItemState>>]} */
    const [state, setState] = useState({ value: "", invalid: false });
    const treeItemCSS = `${styles.treeItem} ${props.className?.outer || props.className}`;
    const levelStyle = { "--level": props.level };

    useEffect(() => {
        if (props.editing && !props.disabled)
            setState({ value: props.name, invalid: false });
        else if (!props.editing)
            setState({ value: "", invalid: false });
    }, [props.editing]);

    if (props.disabled) {
        return <li className={`${treeItemCSS} disabled`} style={levelStyle}>
            <div className={`${styles.treeItem_container} ${props.className?.inner}`}>
                <Icon name="#folder" className={`${styles.treeItem_icon} close`} />
                <Icon name="#folder-open" className={`${styles.treeItem_icon} open`} />
                <span className={styles.treeItem_title}>{props.name}</span>
            </div>
        </li>
    }
    const attr = {
        value: state.value,
        onChange(value) {
            setState({ value, invalid: false })
        },
        onSubmit() {
            props.onSubmit(state.value);
        },
        onCancel: props.onCancel
    };
    const $editing = !props.creating && props.editing && <FormItemAction {...attr} />;
    const $create = !props.editing && props.creating && <FormItemAction {...attr} />;
    const $name = $editing || <Tooltip fixed className={`${styles.treeItem_title} ${props.className?.title}`} data={props} config={TOOLTIP_CONFIG}>
        {props.name}
    </Tooltip>;

    return <li className={treeItemCSS} style={levelStyle}>
        <div className={`${styles.treeItem_container} ${props.className?.inner}`} onClick={hofBubbleNodeNameFilter(["DIV", "SPAN"], props.onClick)}>
            <Icon name="#folder" className={`${styles.treeItem_icon} close`} />
            <Icon name="#folder-open" className={`${styles.treeItem_icon} open`} />
            {$name}
            {props.actions}
        </div>
        {$create}
        {props.children}
    </li>
}


/**
 * @typedef TTreeItemCreateArgs
 * @property {string} value
 * @property {string} invalidMessage
 * @property {(str: string) => void} onChange
 * @property {() => void} onSubmit
 * @property {() => void} onCancel
 */
/**
 * @type {React.ForwardRefExoticComponent<React.RefAttributes<TTreeItemCreateArgs>>}
*/
export function TreeItemCreate(props) {
    // function submit() {
    //     if (state.value) {
    //         if (!/[\\/:*?"<>|]/.test(state.value)) {
    //             return props.onSubmit(state.value);
    //         }
    //         ref.current.setCustomValidity(`文件名不能包含以下字符\n\\ / : * ? " < > |`);
    //         ref.current.reportValidity();
    //     }
    // }
    const attrInput = {
        // ref,
        placeholder: "请输入文件夹名",
        // pattern: '[^\\/:*?"<>|]+',
        value: props.value,
        onChange: hofGetDOMValue(props.onChange),
        // onChange: hofGetDOMValue(value => {
        //     console.log('oc', value)
        //     const invalid = /[\\/:*?"<>|]/.test(value);
        //     const validMessage = invalid ? `文件名不能包含以下字符\n\\ / : * ? " < > |` : "";
        //     ref.current.setCustomValidity(validMessage);
        //     setState({ value, invalid });
        // }),
        onKeyPress(ev) {
            if ("Enter" === ev.code || 13 === ev.charCode) {
                props.onSubmit();
            }
        }
    };
    const attrActionGroup = {
        icons: ITEM_ACTION,
        onClick: hofDOMClassFilter({
            submit: props.onSubmit,
            cancel: props.onCancel
        })
    };

    return <div className={styles.treeItem_create}>
        <label>
            <input {...attrInput} />
            <IconBar {...attrActionGroup}/>
        </label>
    </div>;
};
