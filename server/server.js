const path = require('path');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const  { authMiddleware } = require('./utils/auth');

//import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas')
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();
//create new Apollo server & pass in schema data
const server = new ApolloServer({
  typeDefs, resolvers,
  context: authMiddleware
});

//integrate Apollo w/ Express applications as middleware
server.start().then(() => {
  server.applyMiddleware({ app })
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    //log to test GraphQL API
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});