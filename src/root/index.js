import React, { useState } from "react";
import Body from "./body";
import Top from "./top";
import withDataAdapter from "./data-adapter";

/** @typedef {import("root/data-adapter.js").TTreeItem} TTreeItem */

/**
 * @typedef TIndexContextAction
 * @property {(folder: TTreeItem) => void} setCurrFolder
 */
/**
 * @typedef TIndexContext
 * @property {TTreeItem} currFolder
 * @property {TIndexContextAction} actions
 */
/** @type {React.Context<TIndexContext>} */
export const IndexContext = React.createContext({ currFolder: null });

export default withDataAdapter(function Root({ value: ctx }) {
    const [state, setState] = useState({ currFolder: null });
    const value = {
        currFolder: state.currFolder,
        action: {
            setCurrFolder(target) {
                if (ctx.data?.kvs?.[target?.$key] && !target?.size) {
                    console.log('folder', target)
                }
            }
        }
    };
    return <IndexContext.Provider value={value}>
        <Top value={value} />
        <Body value={value} />
    </IndexContext.Provider>;
})
