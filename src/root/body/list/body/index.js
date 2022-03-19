import React, { useContext, useRef } from "react";
import { HorizontalResizeParent } from "component/resize-panel";
import { Context as DataContext } from "root/data-adapter";
import { isNotNullArray } from "utils/c";
import styles from "./index.module.scss";


function listRender(list) {
    return isNotNullArray(list) && list.reduce((prev, curr) => {
        if (curr.size) {
            prev.push(<ol key={curr.path} className={styles.list_row}>
                <li className={`${styles.list_item} name`}>{curr.name}</li>
                <li className={`${styles.list_item} size`}>{curr.size}</li>
            </ol>);
        }
        return prev;
    }, []);
}

export default function ListBody() {
    const { currFolder } = useContext(DataContext);
    const refs = {
        $:  useRef(null)
    }
    const attr = {
        resize: {
            parent:         refs.$.current,
            className:      styles.header,
            toggleClassName:styles.header_toggle,
            nodeName:       "header",
            vars:           ["--NAME_WIDTH", "--SIZE_WIDTH"]
        }
    };
    return <div className={styles.body} ref={refs.$}>
        <HorizontalResizeParent {...attr.resize}>
            <span className={`${styles.list_item} name`}>文件名</span>
            <span className={`${styles.list_item} size`}>大小</span>
        </HorizontalResizeParent>
        <div className={styles.list}>{listRender(currFolder?.children)}</div>
    </div>
}
