import { ReactElement } from "react";
import { GetStaticProps } from "../../lib/next";

interface SSGPageProps {
    text: string
}

export default function SSGPage({text}: SSGPageProps): ReactElement {
    return <p>Hello {text}</p>
}

export const getStaticProps: GetStaticProps<SSGPageProps> = async ({params}) => {
    return {
        props: {
            text: "foobar " + params.id
        }
    }
}
