// server/microservices/product-service/product-microservice.js
// Import required modules
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
//
import { parse } from 'graphql';  // Import GraphQL parser
import { config } from './config/config.js';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import connectDB from './config/mongoose.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
//
console.log("🔍 JWT_SECRET in service:", process.env.JWT_SECRET);

// Connect to MongoDB
connectDB();
// Create an Express app
const app = express();
app.use(cors({
  origin: ['https://communityengagement.onrender.com',
           'https://communityengagement-clientuserauth.onrender.com', 
           'https://communityengagement-clientcommengagement.onrender.com',
           'https://communityengagement-3cq8.onrender.com', 
           'http://localhost:4000', 
           'https://studio.apollographql.com'],
  credentials: true,
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://communityengagement.onrender.com'); 
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Fix: Parse `typeDefs` before passing it to `buildSubgraphSchema`
const schema = buildSubgraphSchema([{ typeDefs: parse(typeDefs), resolvers }]);

const server = new ApolloServer({
  schema,
  introspection: true,
});

async function startServer() {
  await server.start();
  // Apply the Apollo GraphQL middleware and set the path to /graphql
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      // Get the user token from the headers.
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      let user = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          user = decoded;
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      }
      // Add the user to the context
      return { user, res };
    }
  }));
  //
  app.listen(config.port, () => console.log(`🚀 Business and Events Microservice running at http://localhost:${config.port}/graphql`));
}
//
startServer();

