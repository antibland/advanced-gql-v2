const { ApolloServer, PubSub } = require("apollo-server");
const gql = require("graphql-tag");

const pubSub = new PubSub();
const NEW_ITEM = "NEW_ITEM";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    createdAt: Int!
  }

  type Settings {
    user: User!
    theme: String!
  }

  type Item {
    task: String!
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Query {
    me: User
    settings(userId: ID!): Settings
  }

  type Mutation {
    settings(input: NewSettingsInput!): Settings
    createItem(task: String!): Item!
  }

  type Subscription {
    newItem: Item
  }
`;

const user = {
  id: 1,
  username: "antibland",
  createdAt: 343421343,
};

const resolvers = {
  Query: {
    me: () => {
      return user;
    },
    settings(_, { user }) {
      return {
        user,
        theme: "Light",
      };
    },
  },
  Mutation: {
    settings(_, { input }) {
      return input;
    },
    createItem(_, { task }) {
      const item = { task };
      pubSub.publish(NEW_ITEM, { newItem: item });
      return item;
    },
  },
  Settings: {
    user: (settings) => {
      return user;
    },
  },
  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator(NEW_ITEM),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({ connection }) {
    if (connection) {
      return { ...connection.context };
    }
  },
  subscriptions: {
    onConnect(params) {},
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
