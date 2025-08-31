import { ApolloServer } from "apollo-server-express";
import { resolvers, typeDefs } from "./graphql/schema.js";
import { db } from './database/connection.js';
import express from 'express';

const app = express();
const server = new ApolloServer({ typeDefs: typeDefs, resolvers: resolvers });

const startServer = async () => {
    await server.start();
    server.applyMiddleware({ app });
    app.listen(process.env.PORT, () => {
        console.log(`Server started at  http://localhost:${process.env.PORT}${server.graphqlPath}`);
    });
};
await startServer();
