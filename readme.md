# Community Engagement Platform

A modern platform designed to foster community connections through shared posts, events, business promotions, and AI-assisted interactions.

## 📋 Overview

The Community Engagement Platform addresses the lack of communication within communities by creating a digital space where residents, business owners, and event organizers can interact, share information, and build stronger community bonds. Through gamification elements and AI-powered features, the platform encourages active participation and makes community information more accessible.

## ✨ Features

### User Roles

- **Residents** - Post community messages, request help, volunteer for community initiatives, view local business deals, and access community events
- **Business Owners** - Manage multiple business listings, post promotional deals, engage as residents when desired
- **Event Organizers** - Create and manage community events, participate as residents when desired

### Key Capabilities

- **Community Feed** - Central hub for community posts, help requests, and announcements
- **Business Listings** - Local businesses can showcase their services and post special deals
- **Event Calendar** - Community events organized and promoted by verified event organizers
- **Volunteer System** - Residents can offer help on community posts and initiatives

### AI Integration

- **AI Chatbot** powered by Google's Gemini API
  - Knowledge base of community posts and help requests
  - Content summarization for lengthy community posts
  - Sentiment analysis for deal comment sections

### Gamification

- **Level System** - Users gain experience through platform engagement
- **Badges** - Achievement markers for community contributions
- **Achievements** - Special milestones to encourage participation

## 🛠️ Tech Stack

- **Frontend**: React
- **Backend**: Node.js
- **API**: GraphQL
- **Database**: MongoDB (Atlas)
- **AI**: Google Gemini API with LangGraph, embeddings, and RAG

## 🏗️ Architecture

The platform is built using a microservices and micro-frontends architecture:

### Backend Microservices
- **CommEngagement** - Handles community posts, help requests, and volunteering
- **UserAuth** - Manages user authentication with JWT
- **BusinessAndEvents** - Controls business listings, deals, and community events
- **Gateway** - API gateway for service federation

### Frontend Micro-applications
- **comm-engagement** - Community feed and interaction components
- **user-app** - User profile and authentication features
- **business-events** - Business listings and event management
- **shell-app** - Main application container and routing

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/ctoledocarlo/community-engagement.git
   cd community-engagement
   ```

2. Install dependencies for all services
   ```
   # Backend services
   cd backend/microservices/CommEngagement && npm install
   cd ../UserAuth && npm install
   cd ../BusinessAndEvents && npm install
   cd ../../ && npm install
   
   # Frontend applications
   cd ../client/comm-engagement && npm install
   cd ../user-app && npm install
   cd ../business-events && npm install
   cd ../shell-app && npm install
   ```

3. Configure environment variables
   - Create `.env` files in each microservice directory with appropriate variables
   - Add MongoDB connection strings
   - Configure Google Gemini API keys

### Running the Application

#### Backend Services
```bash
# Start CommEngagement service
cd backend/microservices/CommEngagement
npm run dev

# Start UserAuth service
cd ../UserAuth
npm run dev

# Start BusinessAndEvents service
cd ../BusinessAndEvents
npm run dev

# Start API Gateway
cd ../../
node gateway.js
```

#### Frontend Applications
```bash
# Deploy comm-engagement micro-frontend
cd client/comm-engagement
npm run deploy

# Deploy user-app micro-frontend
cd ../user-app
npm run deploy

# Deploy business-events micro-frontend
cd ../business-events
npm run deploy

# Start shell application
cd ../shell-app
npm run dev
```

The application will be available at `http://localhost:3000` by default.

## 📱 User Flow

1. **Registration & Authentication**
   - Users register and select their role(s)
   - JWT-based authentication secures user sessions

2. **Community Interaction**
   - Residents post community messages and help requests
   - Other users can volunteer or comment on posts
   - AI chatbot assists with information and summarization

3. **Business Engagement**
   - Business owners manage listings and post deals
   - Residents view and comment on business promotions
   - Sentiment analysis provides feedback on deal reception

4. **Event Participation**
   - Event organizers create and manage community events
   - Residents discover and engage with local events

5. **Gamification**
   - All actions earn experience points
   - Users unlock badges and achievements
   - Level progression showcases community involvement

## 🔮 Future Enhancements

- Mobile application
- Integration with local government services
- Enhanced analytics for community engagement metrics
- Real-time notifications and messaging
- Community polls and voting system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.

## 📫 Contact

For questions or feedback about this project, please open an issue on the GitHub repository.
