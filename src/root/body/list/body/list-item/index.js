import React, { useMemo } from "react";
import { deepFreeze, getReadableSize } from "utils/c";
import { Icon } from "component/icon";

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
    },
    itemActions: [

    ]
});

/**
 * @typedef TListItemArgs
 * @property {number} idx 索引
 */
/** @param {TTreeItem & TListItemArgs} props */
export default function ListItem(props) {

    const itemIcon = useMemo(() => {
        const suffix = props.name?.split(".").pop().toLowerCase();
        const iconName = DEF.fileIcon[suffix] || "#file";
        return <Icon name={iconName} />; 
    }, [props.name]);
    const itemSize = useMemo(() => getReadableSize(props.size), [props.size]);

    return <ul className={styles.listItem}>
        <li className={`${styles.listItem_item} idx`}>
            <span className="text">{props.idx}</span>
        </li>
        <li className={`${styles.listItem_item} name`}>
            {itemIcon}
            <span className="text" title={props.name}>{props.name}</span>
        </li>
        <li className={`${styles.listItem_item} size`}>{itemSize}</li>
    </ul>;
}