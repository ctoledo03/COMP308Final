// user-app/src/App.jsx
import UserComponent from './UserComponent';
//
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Set up Apollo Client

const client = new ApolloClient({
  uri: 'https://communityengagement-authmicroservice.onrender.com/graphql', 
  cache: new InMemoryCache(),
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

function App() {

  return (
    <div className='App'>
      <ApolloProvider client={client}>
            <UserComponent  />
      </ApolloProvider>
    </div>
  );
}

export default App;

