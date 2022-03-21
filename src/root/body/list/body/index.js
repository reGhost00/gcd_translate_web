import React, { useContext, useRef } from "react";
import { HorizontalResizeParent } from "component/resize-panel";
import { Context as DataContext } from "root/data-adapter";
import { hookGetState } from "utils/r";
import { getReadableSize, isNotNullArray } from "utils/c";
import styles from "./index.module.scss";
import { Icon } from "component/icon";

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */

const DEF = Object.freeze({
    fileIcon: {
        mp3:    "#file-music",
        ape:    "#file-music",
        flac:   "#file-music",
        wav:    "#file-music",
        bmp:    "#file-image",
        jpg:    "#file-image",
        jpeg:   "#file-image",
        jpe:    "#file-image",
        png:    "#file-image",
        gif:    "#file-image",
        cue:    "#file-lines",
        lrc:    "#file-lines",
        iso:    "#compact-disc"
    }


});

/**
 * @typedef TListBodyState
 * @property {TTreeItem} currFile
 * @property {TTreeItem[]} selectedFile
 */

export default function ListBody() {
    const { currFolder } = useContext(DataContext);
    /** @type {TListBodyState} */
    const state = hookGetState({ currFile: null, selectedFile: [] });

    const refs = {
        $:  useRef(null)
    }
    const attrResize = {
        parent:         refs.$.current,
        className:      styles.header,
        toggleClassName:styles.header_toggle,
        nodeName:       "header",
        vars:           [null, "--NAME_WIDTH", "--SIZE_WIDTH"]
    };
    function listRender() {
        return isNotNullArray(currFolder?.children) && currFolder.children.reduce((prev, curr, idx) => {
            if (curr.size) {
                const fileSuffix = curr.name.split('.').pop().toLowerCase();
                prev.push(<ul key={curr.path} className={styles.list_row}>
                    <li className={`${styles.list_item} idx`}>
                        <input type="checkbox" />
                        <span>{idx + 1}</span>
                    </li>
                    <li className={`${styles.list_item} name`}>
                        <Icon name={DEF.fileIcon[fileSuffix] || "#file"} />
                        <span className="P05">{curr.name}</span>
                    </li>
                    <li className={`${styles.list_item} size`}>{getReadableSize(curr.size)}</li>
                </ul>);
            }
            return prev;
        }, []);
    }
    return <div className={styles.body} ref={refs.$}>
        <HorizontalResizeParent {...attrResize}>
            <span className={`${styles.list_item} idx`}>#</span>
            <span className={`${styles.list_item} name`}>文件名</span>
            <span className={`${styles.list_item} size`}>大小</span>
        </HorizontalResizeParent>
        <div className={styles.list}>{listRender()}</div>
    </div>
}
