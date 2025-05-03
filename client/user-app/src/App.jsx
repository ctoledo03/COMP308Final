// user-app/src/App.jsx
import UserComponent from './UserComponent';
//
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Set up Apollo Client

const client = new ApolloClient({
  uri: 'https://communityengagement-gateway.onrender.com/graphql', // Set this to your actual GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: 'include'
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

