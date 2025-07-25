import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT as string;

export async function querySubgraph(query: string, variables?: Record<string, any>) {
  const client = new GraphQLClient(endpoint);
  return client.request(query, variables);
}