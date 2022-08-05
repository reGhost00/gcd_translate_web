import React, { useContext, useRef } from "react";
import { HorizontalResizeParent } from "component/resize-panel";
import { Context as DataContext } from "root/data-adapter";
import { hookGetState } from "utils/r";
import { deepFreeze, getReadableSize, isNotNullArray } from "utils/c";
import styles from "./index.module.scss";
import { Icon } from "component/icon";
import ListItem from "./list-item";
import { VirtualList } from "component/virtual-list";

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */

const DEF = deepFreeze({
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
        const list = isNotNullArray(currFolder?.children) && currFolder.children.reduce((prev, curr) => {
            /*
            if (curr.size) {
                const fileSuffix = curr.name.split('.').pop().toLowerCase();
                const checkboxAttr = {
                    type:   "checkbox",
                    title:  "选中此文件",
                    name:   "selectedFile",
                    checked:state.selectedFile.includes(curr.path),
                    onChange(ev) {
                        const checked = ev.target.checked;
                        if (checked)
                            state.selectedFile = [curr.path, ...state.selectedFile];
                        else
                            state.selectedFile = state.selectedFile.filter(path => path !== curr.path)
                    }
                };
                prev.push(<ul key={curr.path} className={`${styles.list_row} ${state.selectedFile.includes(curr.path) && "selected"}`}>
                    <li className={`${styles.list_item} idx`}>
                        <input {...checkboxAttr} />
                        <span>{idx + 1}</span>
                    </li>
                    <li className={`${styles.list_item} name`}>
                        <Icon name={DEF.fileIcon[fileSuffix] || "#file"} />
                        <span className="P05 OVF">{curr.name}</span>
                    </li>
                    <li className={`${styles.list_item} size`}>{getReadableSize(curr.size)}</li>
                </ul>);
            }
            */
            if (curr.size) {
                prev.push(<ListItem key={curr.path} idx={prev.length + 1} {...curr}/>)
            }
            return prev;
        }, []);
        return <div className={styles.list}>{list}</div>;
    }
    return <div className={styles.body} ref={refs.$}>
        <HorizontalResizeParent {...attrResize}>
            <span className={`${styles.header_item} idx`}>#</span>
            <span className={`${styles.header_item} name`}>文件名</span>
            <span className={`${styles.header_item} size`}>大小</span>
        </HorizontalResizeParent>
        {/* {listRender()} */}
        <VirtualList rowHeight="35" data={currFolder?.children}>
            {function render({ index }) {
                const item = currFolder.children[index];
                return <ul key={item.path} className={styles.list_row}>
                    <li className={`${styles.list_item} idx`}>{index + 1}</li>
                    <li className={`${styles.list_item} name`}>{item.name}</li>
                    <li className={`${styles.list_item} size`}>{getReadableSize(item.size)}</li>
                </ul>
            }}
        </VirtualList>
    </div>
}
