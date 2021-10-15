import { ReactNode } from "react";
import { GetStaticProps } from "../../lib/next";

interface SSGPageProps {
    text: string
}

export default function SSGPage({text}: SSGPageProps): ReactNode {
    return <p>Hello {text}</p>
}

export const getStaticProps: GetStaticProps<SSGPageProps> = async () => {
    return {
        props: {
            text: "foobar"
        }
    }
}
