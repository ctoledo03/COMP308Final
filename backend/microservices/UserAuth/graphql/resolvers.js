import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import {config} from '../config/config.js';
import { GraphQLError } from 'graphql';

const resolvers = {
    Query: {
        me: (_, __, context) => {
            const { req } = context;
        
            if (!req || !req.cookies) {  // ✅ Ensure `req` exists
              console.log("🚨 Request object is missing!");
              return null;
            }
        
            const token = req.cookies.token;
            if (!token) {
              return null;  // No user is logged in
            }
        
            try {
              console.log("🔍 JWT_SECRET in resolvers.js:", config.JWT_SECRET);
              const decoded = jwt.verify(token, config.JWT_SECRET);
              return { id: decoded.user._id, username: decoded.user.username }
            } catch (error) {
              console.error("Error verifying token:", error);
              return null;
            }
          },
        },
   
    Mutation: {
        async signup(_, { username, email, password, role }, { res }) {
            const existingUser = await User.findOne({ 
                $or: [{ username }, { email }] 
            });
              
            if (existingUser) {
                throw new GraphQLError(
                    existingUser.username === username ? 
                    'Username already exists' : 'Email already exists', 
                    { extensions: { code: 'BAD_USER_INPUT' } }
                );
            }

            const newUser = new User({ username, password: password });
            await newUser.save();
            return true;
        },

        login: async (_, { username, password }, { res }) => {
            const user = await User.findOne({ username });
            if (!user) {
              throw new Error('User not found');
            }
        
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
              throw new Error('Invalid password');
            }
        
            const token = jwt.sign({ user }, config.JWT_SECRET, { expiresIn: '1d' });
        
            res.cookie('token', token, {
              httpOnly: true, // Prevents JavaScript access
              //secure: false,  // Change to true for HTTPS
              //sameSite: 'None', // Use 'None' if different origins
              maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
            console.log("✅ Cookie set in response:", res.getHeaders()['set-cookie']);
            console.log("✅ Cookie set:", res.getHeaders()['set-cookie']);
            
            return true;
        },
      
        logout(_, __, { res }) {
            res.clearCookie('token');
            res.clearCookie('_xsrf');
            res.clearCookie('username-localhost-8888');
            return true;
        },
    },
};

export default resolvers;
