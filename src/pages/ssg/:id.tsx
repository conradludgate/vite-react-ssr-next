import { ReactNode } from "react";
import { GetStaticPaths, GetStaticProps, GetStaticPathsResponse } from "../../lib/next";

interface SSGPageProps {
    text: string
}

export default function SSGPage({text}: SSGPageProps): ReactNode {
    return <p>Hello {text}</p>
}

export const getStaticProps: GetStaticProps<SSGPageProps> = async ({params}) => {
    return {
        props: {
            text: "foobar " + params.id
        }
    }
}
