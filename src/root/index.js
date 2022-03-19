import Body from "./body"
import Top from "./top"
import { DataAdapter } from "./data-adapter";

export default function Root() {
    return <DataAdapter>
        <Top/>
        <Body/>
    </DataAdapter>;
}
