import { ReactElement } from "react";

export type GetServerSideProps<Props> = (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResponse<Props>>;

export interface GetServerSidePropsContext {
    params: Record<string, string>
}

export interface GetServerSidePropsResponse<Props> {
    props?: Props,
    notFound?: boolean,
}

export type GetStaticProps<Props> = (context: GetStaticPropsContext) => Promise<GetStaticPropsResponse<Props>>;

export interface GetStaticPropsContext {
    params: Record<string, string>
}

export interface GetStaticPropsResponse<Props> {
    props?: Props,
    notFound?: boolean,
}

export interface PageComponent<Props> {
    default: React.JSXElementConstructor<Props>
    getServerSideProps? : GetServerSideProps<Props>
    getStaticProps? : GetStaticProps<Props>
}
