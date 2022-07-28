const {
  ApolloServer,
  PubSub,
  AuthenticationError,
  UserInputError,
  ApolloError,
  SchemaDirectiveVisitor,
} = require("apollo-server");
const gql = require("graphql-tag");

const { defaultFieldResolver, GraphQLString } = require("graphql");

const pubSub = new PubSub();
const NEW_ITEM = "NEW_ITEM";

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.args.push({
      type: GraphQLString,
      name: "message",
    });

    field.resolve = (root, { message, ...rest }, context, info) => {
      const { message: schemaMessage } = this.args;
      console.log(`⚡️ hello`, message || schemaMessage);
      return resolver.call(this, root, rest, context, info);
    };
  }
}

const typeDefs = gql`
  directive @log(message: String = "my message") on FIELD_DEFINITION
  type User {
    id: ID! @log
    error: String! @deprecated(reason: "use error2 instead")
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
  User: {
    error: () => {
      throw new AuthenticationError("nope");
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective,
  },
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
