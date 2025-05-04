import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import {config} from '../config/config.js';
import { GraphQLError } from 'graphql';

const resolvers = {
    Query: {
        me: (_, __, context) => {
            const { req } = context;
        
            if (!req || !req.cookies) {  
              console.log("🚨 Request object is missing!");
              return null;
            }
        
            const token = req.cookies.token;
            if (!token) {
              return null;  
            }
        
            try {
              console.log("🔍 JWT_SECRET in resolvers.js:", config.JWT_SECRET);
              const decoded = jwt.verify(token, config.JWT_SECRET);
              console.log("Decoded token:", decoded);
              return { 
                id: decoded.user._id, 
                username: decoded.user.username,
                role: decoded.user.role 
              }
            } catch (error) {
              console.error("Error verifying token:", error);
              return null;
            }
          },
        },
   
    Mutation: {
        async signup(_, { username, email, password, role }, { res }) {
            try {
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

                // Validate role
                const validRoles = ['resident', 'business_owner', 'community_organizer'];
                if (!validRoles.includes(role)) {
                    throw new GraphQLError('Invalid role specified', {
                        extensions: { code: 'BAD_USER_INPUT' }
                    });
                }

                // Create user with raw password - let the pre-save hook handle hashing
                const newUser = new User({ 
                    username, 
                    email, 
                    password, // Don't hash here - the model will do it
                    role 
                });
                
                await newUser.save();

                const token = jwt.sign({ 
                    user: {
                        _id: newUser._id,
                        username: newUser.username,
                        role: newUser.role
                    } 
                }, config.JWT_SECRET, { expiresIn: '1d' });
                
                res.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'None', 
                    secure: true,  
                    maxAge: 24 * 60 * 60 * 1000,
                });

                return true;
            } catch (error) {
                console.error('Signup error:', error);
                throw error;
            }
        },

        login: async (_, { username, password }, { res }) => {
            try {
                const user = await User.findOne({ username });
                if (!user) {
                    throw new GraphQLError('User not found', {
                        extensions: { code: 'AUTHENTICATION_ERROR' }
                    });
                }
                
                console.log('🔍 Attempting login for user:', username);
                // Use the model's comparePassword method
                const match = await user.comparePassword(password);
                if (!match) {
                    console.log('❌ Password mismatch for user:', username);
                    throw new GraphQLError('Invalid password', {
                        extensions: { code: 'AUTHENTICATION_ERROR' }
                    });
                }
                console.log('✅ Password matched for user:', username);
                
                const token = jwt.sign({ 
                    user: {
                        _id: user._id,
                        username: user.username,
                        role: user.role
                    } 
                }, config.JWT_SECRET, { expiresIn: '1d' });
                
                res.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'None', 
                    secure: true,  
                    maxAge: 24 * 60 * 60 * 1000,
                });
                
                return true;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
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
