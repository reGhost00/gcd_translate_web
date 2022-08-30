import React from "react";
import { Icon } from "component/icon";
import Tooltip from "component/grid-tooltip";
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

const TOOLTIP_CONFIG = Object.freeze({
    name: "文件名",
    path: "路径",
    size: "大小"
});

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */
/**
 * @typedef TListRowArgs
 * @property {TTreeItem} item 行数据
 * @property {boolean} disabled 滚动或缩放过程中
 */
/**
 * @param {TListRowArgs}
 */
export default function ListRow({ item, disabled }) {
    if (item?.path && item.size) {
        const fileSuffix = item.name.split('.').pop().toLowerCase();
        if (disabled) {
            return <li className={`${styles.list_row} disabled`}>
                <span className={styles.list_item_idx}>{item.$idx * 1 + 1}</span>
                <div className={styles.list_item_name}>
                    <Icon className="icon" name={DEF_FILE_ICON[fileSuffix] || "#file"} />
                    <span className="name">{item.name}</span>
                </div>
                <span className={styles.list_item_size}>{getReadableSize(item.size)}</span>
            </li>
        }
        return <li className={styles.list_row}>
            <div className={styles.list_item_idx}>{item.$idx * 1 + 1}</div>
            <Tooltip fixed className={styles.list_item_name} data={item} config={TOOLTIP_CONFIG}>
                <Icon className="icon" name={DEF_FILE_ICON[fileSuffix] || "#file"} />
                <span className="name">{item.name}</span>
            </Tooltip>
            <div className={styles.list_item_size}>{getReadableSize(item.size)}</div>
        </li>
    }
    return null;
}
