import { ReactElement } from "react";
import { useParams } from "react-router";

export default function CSRPage2(): ReactElement {
    const params = useParams<{id: string}>();
    return <p>Hello CSR {params.id}</p>
}
