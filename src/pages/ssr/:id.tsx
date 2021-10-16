import { ReactElement } from "react";
import { GetServerSideProps } from "../../lib/next";

interface SSRPageProps {
    text: string
}

export default function SSRPage({text}: SSRPageProps): ReactElement {
    return <p>Hello {text}</p>
}

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async ({params}) => {
    return {
        props: {
            text: "foobar " + params.id
        }
    }
}
