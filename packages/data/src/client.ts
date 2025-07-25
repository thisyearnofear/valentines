import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT as string;

export const graphClient = new GraphQLClient(endpoint);