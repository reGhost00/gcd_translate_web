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
            setCurrFolder(currFolder) {
                if (ctx.data?.kvs?.[currFolder?.path] && !currFolder?.size) {
                    setState({ currFolder });
                }
            }
        }
    };
    return <IndexContext.Provider value={value}>
        <Top value={value} />
        <Body value={value} />
    </IndexContext.Provider>;
})
