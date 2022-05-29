import React, { useContext, useEffect } from "react";
import { Icon, IconBar } from "component/icon";
import { Context as DataContext } from "root/data-adapter";
import { deepFreeze, hofCallContinue, hofCallWithCondition, hofDOMClassFilter, hofGetDOMValue, isNotNullArray } from "utils/c";
import styles from "./index.module.scss";
import { hofFormBindValue, hookGetState, hookSetState } from "utils/r";
import InputWithMessage from "component/input-with-message";

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
    useEffect(() => {
        state.folderName = props.editing ? props.name : "";
    }, [props.editing]);

    const active = props.path && currFolder && props.path === currFolder.path;
    const iconName = active ? "#folder-open" : "#folder";
    const itemStyle = { "--LEVEL": props.level * 1 || 0 };
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
            className: `${styles.treeItem_item} ${active && "active"}`,
            onClick(ev){
                ev.preventDefault();
                ev.stopPropagation();
                props.onClick(props.path);
            }
        }
    };
    const $item = props.editing ? <div className={styles.treeItem_item_editing}>
        <Icon name={iconName} className={styles.treeItem_item_icon} />
        <InputWithMessage {...attr.input}>
            <IconBar {...attr.iconBar}/>
        </InputWithMessage>
    </div> : <div {...attr.item}>
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
    const attrAction = {
        icons:      DEF.rootActions,
        className:  styles.actionGroup,
        "data-path":"/",
        onClick:    func.onActionGroupClick
    };
    const attrItem = {
        name: "/",
        path: "/",
        actions: <IconBar {...attrAction}/>,
        onClick: func.onItemClick
    }
    /**
     * 渲染文件夹树
     * @param {TTreeItem[]} list
     */
    function treeRender(list, level=0) {
        return isNotNullArray(list) && list.reduce((prev, curr) => {
            if (!curr.size) {
                const creating = curr.path === state.create;
                const editing = state.editing && curr.path === state.editing;
                const attrAction = !editing && {
                    icons:      DEF.itemActions,
                    className:  styles.actionGroup,
                    onClick:    func.onActionGroupClick.bind(curr)
                };
                const attr = {
                    item: Object.assign({
                        level,
                        editing,
                        key:            curr.path,
                        actions:        !editing && <IconBar {...attrAction}/>,
                        onClick:        func.onItemClick,
                        onEditingCancel:func.onActionCancel,
                        onEditingSubmit:func.onEditingSubmit.bind(curr)
                    }, curr),
                    create: creating && Object.assign({

                    }, curr)
                }
                const subs = isNotNullArray(curr.children) && treeRender(curr.children, level + 1);
                const children = [creating && <TreeItemCreate key={`${curr.path}_create`} onSubmit={func.onCreateSubmit.bind(curr)} onCancel={func.onActionCancel} />].concat(subs || []);
                prev.push(<TreeItem {...attr.item}>{children}</TreeItem>);
            }
            return prev;
        }, []);
    }
    return <div className={`${styles.body} ${(state.create || state.editing) && "disabled"}`}>
        <TreeItem {...attrItem}>
            {"/" === state.create && <TreeItemCreate onSubmit={func.onCreateSubmit} onCancel={func.onActionCancel}/> }
        </TreeItem>
        {treeRender(data?.arr)}
    </div>
}
