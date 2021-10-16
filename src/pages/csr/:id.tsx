import { ReactNode } from "react";
import { RouteChildrenProps } from "react-router";

export default function CSRPage({match}: RouteChildrenProps<{id: string}>): ReactNode {
    return <p>Hello CSR {match?.params.id}</p>
}
