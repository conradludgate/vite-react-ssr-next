import { ReactNode } from "react";
import { RouteChildrenProps, useParams } from "react-router";

export default function CSRPage2(): ReactNode {
    const params = useParams<{id: string}>();
    return <p>Hello CSR {params.id}</p>
}
