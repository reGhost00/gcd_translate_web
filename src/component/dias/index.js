import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Icon } from "../icon";
import styles from "./index.module.scss";

const DEF = Object.freeze({
    messageTimeout: 3333
});

/**
 * dom 实例单例
 * @typedef TSingletonInstance
 * @property {HTMLElement} $message message容器
 */
/**
 * dom 容器实例集合
 * @type {TSingletonInstance}
 */
const singletonInstance = {};

/**
 * 获取 message 容器单例
 * @returns {HTMLElement}
 */
function getMessageContainer() {
    singletonInstance.$message = document.getElementById("MESSAGE_CONTAINER");
    if (!(singletonInstance.$message instanceof HTMLElement)) {
        singletonInstance.$message = document.createElement("div");
        singletonInstance.$message.id = "MESSAGE_CONTAINER";
        singletonInstance.$message.className = styles.normalDiaContainer;
        document.body.appendChild(singletonInstance.$message);
    }
    return singletonInstance.$message;
}

/**
 * @callback T
 * @param {*} render
 * @returns
 */
/**
 *
 * @param {*} render
 * @returns
 */
function withMessageContainer(render) {
    return function messageContainerWrap(msg, timeout = DEF.messageTimeout) {
        const $MessageContainer = getMessageContainer();
        const $thisContainer = document.createElement("div");
        $thisContainer.className = styles.thisMessageContainer;
        $MessageContainer.appendChild($thisContainer);
        return render({
            msg,
            timeout,
            $thisContainer,
            onClose() {
                ReactDOM.unmountComponentAtNode($thisContainer);
                $MessageContainer.removeChild($thisContainer);
            }
        });
    }
}
/**
 * 全局消息基础组件属性
 * @typedef TNormalMessageArgs
 * @property {number} [timeout] 卸载定时
 * @property {boolean} [active] 是否显示
 * @property {function} onClose 关闭
 */
/**
 * 全局消息基础组件，带基础样式，自动消失
 * 必须提供active 或 timeout其中一个属性
 * @component
 * @param {TNormalMessageArgs} param
 */
function NormalMessage({ timeout, children, onClose, ...rest }) {
    rest.className = `${styles.dias_normalMessage} ${rest.className || ''}`
    useEffect(() => {
        setTimeout(onClose, timeout > 0 ? timeout : DEF.messageTimeout);
    }, []);
    return <div {...rest}>{children}</div>;
}

export const message = withMessageContainer(function messageNormal({ $thisContainer, msg, ...rest}) {
    return ReactDOM.render(<NormalMessage {...rest}>{msg}</NormalMessage>, $thisContainer);
});

message.info = withMessageContainer(function messageInfo({ $thisContainer, msg, ...rest }) {
    rest.className = styles.info;
    return ReactDOM.render(<NormalMessage {...rest}>
        <Icon name="#circle-info" className="icon"/>{msg}
    </NormalMessage>, $thisContainer);
});

message.succ = withMessageContainer(function messageSucc({ $thisContainer, msg, ...rest }) {
    rest.className = styles.succ;
    return ReactDOM.render(<NormalMessage {...rest}>
        <Icon name="#circle-check" className="icon"/>{msg}
    </NormalMessage>, $thisContainer);
});

message.warn = withMessageContainer(function messageWarn({ $thisContainer, msg, ...rest }) {
    rest.className = styles.warn;
    return ReactDOM.render(<NormalMessage {...rest}>
        <Icon name="#circle-exclamation" className="icon"/>{msg}
    </NormalMessage>, $thisContainer);
});

message.error = withMessageContainer(function messageError({ $thisContainer, msg, ...rest }) {
    rest.className = styles.error;
    return ReactDOM.render(<NormalMessage {...rest}>
        <Icon name="#circle-xmark" className="icon"/>{msg}
    </NormalMessage>, $thisContainer);
});
