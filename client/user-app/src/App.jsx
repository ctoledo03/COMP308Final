// user-app/src/App.jsx
import UserComponent from './UserComponent';
//
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Set up Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:4001/graphql', // Set this to your actual GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: 'include'
  // force redeploy
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

