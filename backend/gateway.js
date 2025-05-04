// server/gateway.js
//
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//

const app = express();

// ✅ Fix: Add middleware to parse JSON requests
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

// Enable CORS and Cookie Parsing
app.use(cors({
  origin: ['https://communityengagement.onrender.com', 
           'https://communityengagement-clientuserauth.onrender.com', 
           'https://communityengagement-clientcommengagement.onrender.com', 
           'https://communityengagement-3cq8.onrender.com',
           'https://studio.apollographql.com'],
  credentials: true,
}));
app.use(cookieParser());

// Configure the Apollo Gateway for microservices
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'https://communityengagement-authmicroservice.onrender.com/graphql' },
      { name: 'community', url: 'https://communityengagement-commengmicroservice.onrender.com/graphql' },
      { name: 'businessAndEvents', url: 'https://communityengagement-qdh2.onrender.com/graphql' },
    ],
  }),
});

// Initialize Apollo Server
const server = new ApolloServer({
  gateway,
  introspection: true,
});

async function startServer() {
  await server.start();
  
  // Apply Express middleware for Apollo Server
  app.use('/graphql', expressMiddleware(server));

  // Start Express server
  app.listen(4000, () => {
    console.log(`🚀 API Gateway ready`);
  });
}

startServer();
