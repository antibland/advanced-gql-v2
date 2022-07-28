const { ApolloServer, AuthenticationError } = require("apollo-server");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { createToken, getUserFromToken } = require("./auth");
const {
  FormattedDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
} = require("./directives");
const db = require("./db");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formattedDate: FormattedDateDirective,
    authenticated: AuthenticationDirective,
    authorized: AuthorizationDirective,
  },
  context({ req, connection }) {
    const context = { ...db };
    if (connection) {
      return { ...context, ...connection.context };
    }
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...context, user, createToken };
  },
  subscriptions: {
    onConnect(params) {
      const token = params.Authorization;
      const user = getUserFromToken(token);
      if (!user) throw new AuthenticationError("user is invalid");
      return { user };
    },
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
