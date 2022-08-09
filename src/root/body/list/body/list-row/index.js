import { Icon } from "component/icon";
import React from "react";
import { getReadableSize } from "utils/c";
import styles from "./index.module.scss";

const DEF_FILE_ICON = Object.freeze({
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
});

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */
/**
 * @typedef TListRowArgs
 * @property {TTreeItem} data
 * @property {boolean} scrolling
 */
/**
 * @param {TListRowArgs}
 */
export default function ListRow({ index, data, scrolling }) {
    if (scrolling) {
        return <li className={styles.list_row}>
            <div className={`${styles.list_item} idx`}>{index + 1}</div>
            <div className={`${styles.list_item} name`}>{data.name}</div>
            <div className={`${styles.list_item} size`}>{getReadableSize(data.size)}</div>
        </li>
    }
    const fileSuffix = data.name.split('.').pop().toLowerCase();
    return <li className={styles.list_row}>
        <div className={`${styles.list_item} idx`}>
            <span>{index + 1}</span>
        </div>
        <div className={`${styles.list_item} name`}>
            <Icon name={DEF_FILE_ICON[fileSuffix] || "#file"} />
            <span>{data.name}</span>
        </div>
        <div className={`${styles.list_item} size`}>{getReadableSize(data.size)}</div>
    </li>
}
