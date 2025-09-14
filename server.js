import { ApolloServer } from "apollo-server-express";
import { resolvers, typeDefs } from "./graphql/schema.js";
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: (req, res) => {
        // check whether the endpoint is of refresh token 
        // then bypass the token validation
        // Need to do

        const token = req.headers?.['Authorization']?.split(' ')?.[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded?.id) {
            throw new Error('Not authorized');
        }
        return {
            id: decoded.id
        }
    }
});

const startServer = async () => {
    await server.start();
    server.applyMiddleware({ app });
    app.listen(process.env.PORT, () => {
        console.log(`Server started at  http://localhost:${process.env.PORT}${server.graphqlPath}`);
    });
};
await startServer();
