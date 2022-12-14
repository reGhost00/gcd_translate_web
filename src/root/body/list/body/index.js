import React, { useContext, useRef } from "react";
import { HorizontalResizeParent } from "component/resize-panel";
import { VirtualList } from "component/virtual-list";
import ListRow from "./list-row";

import { IndexContext } from "root";

import { classNamesGenerator, deepFreeze, getReadableSize, isNotNullArray } from "utils/c";
import styles from "./index.module.scss";



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
const DEF_ROW_HEIGHT = 35;
/**
 * @typedef TListBodyState
 * @property {TTreeItem} currFile
 * @property {TTreeItem[]} selectedFile
 */

export default function ListBody() {
    const { currFolder, action } = useContext(IndexContext);
    //  const currFolder = {};
    /** @type {TListBodyState} */
    // const state = hookGetState({ currFile: null, selectedFile: [] });

    const refs = {
        $:  useRef(null)
    }

    const attr = {
        resize: {
            parent: refs.$.current,
            className: styles.header,
            toggleClassName: styles.header_toggle,
            nodeName: "header",
            vars: [null, "--NAME_WIDTH", "--SIZE_WIDTH"]
        },
        list: {
            className: styles.list,
            rowHeight: DEF_ROW_HEIGHT,
            rowCount: currFolder?.children?.length || 0,
            data: currFolder?.children || null,
            component: {
                outer: "article",
                inner: "ol",
                empty() {
                    return <div className="empty_list_item">无数据</div>
                }
            },
            setRowKey(idx) {
                return currFolder?.children?.[idx]?.path || idx;
            }
        }
    };
    // function listRender() {
    //     const list = isNotNullArray(currFolder?.children) && currFolder.children.reduce((prev, curr) => {
    //         /*
    //         if (curr.size) {
    //             const fileSuffix = curr.name.split('.').pop().toLowerCase();
    //             const checkboxAttr = {
    //                 type:   "checkbox",
    //                 title:  "选中此文件",
    //                 name:   "selectedFile",
    //                 checked:state.selectedFile.includes(curr.path),
    //                 onChange(ev) {
    //                     const checked = ev.target.checked;
    //                     if (checked)
    //                         state.selectedFile = [curr.path, ...state.selectedFile];
    //                     else
    //                         state.selectedFile = state.selectedFile.filter(path => path !== curr.path)
    //                 }
    //             };
    //             prev.push(<ul key={curr.path} className={`${styles.list_row} ${state.selectedFile.includes(curr.path) && "selected"}`}>
    //                 <li className={`${styles.list_item} idx`}>
    //                     <input {...checkboxAttr} />
    //                     <span>{idx + 1}</span>
    //                 </li>
    //                 <li className={`${styles.list_item} name`}>
    //                     <Icon name={DEF.fileIcon[fileSuffix] || "#file"} />
    //                     <span className="P05 OVF">{curr.name}</span>
    //                 </li>
    //                 <li className={`${styles.list_item} size`}>{getReadableSize(curr.size)}</li>
    //             </ul>);
    //         }
    //         */
    //         if (curr.size) {
    //             prev.push(<ListItem key={curr.path} idx={prev.length + 1} {...curr}/>)
    //         }
    //         return prev;
    //     }, []);
    //     return <div className={styles.list}>{list}</div>;
    // }
    function listRender({ index, scrolling, resizing }) {
        const attr = {
            item: currFolder?.children?.[index] || null,
            disabled: scrolling || resizing
        };
        return <ListRow {...attr} />;
    }
    return <div className={styles.body} ref={refs.$}>
        <HorizontalResizeParent {...attr.resize}>
            <span className={`${styles.header_item} idx`}>#</span>
            <span className={`${styles.header_item} name`}>文件名</span>
            <span className={`${styles.header_item} size`}>大小</span>
        </HorizontalResizeParent>
        {/* {listRender()} */}
        <VirtualList {...attr.list}>
            {listRender}
        </VirtualList>
    </div>
}
