// server/microservices/auth-service/auth-microservice.js
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

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

connectDB();

const app = express();
app.use(cors({
  origin: ['https://communityengagement.onrender.com',
           'https://communityengagement-clientuserauth.onrender.com', 
           'http://localhost:3000',
           'http://localhost:3001', 
           'http://localhost:3002', 
           'http://localhost:4000', 
           'https://studio.apollographql.com'],
  credentials: true,
}));

app.use((req, res, next) => {
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); 
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

const schema = buildSubgraphSchema([{ typeDefs: parse(typeDefs), resolvers }]);
// 
const server = new ApolloServer({
  schema,
  introspection: true,
});
// 
async function startServer() {
  await server.start();
  // 
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      console.log("🔍 Auth Microservice: Checking request cookies:", req.cookies);
      // Check for token in cookies or headers
      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
      let user = null;
      // Verify token
      if (token) {
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          user = decoded;
          console.log("✅ Authenticated User:", user.user.username);
        } catch (error) {
          console.error("🚨 Token verification failed:", error);
        }
      }
      return { user, req, res };
    }
  }));
  
  //
  //
  app.listen(config.port, () => console.log(`🚀 Auth Microservice running at http://localhost:${config.port}/graphql`));
}
//
startServer();

