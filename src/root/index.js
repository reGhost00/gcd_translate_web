import Body from "./body"
import Top from "./top"
import { NetworkAdapter } from "./data-adapter";
export default function Root() {
    return <NetworkAdapter>
        <Top/>
        <Body/>
    </NetworkAdapter>;
}
