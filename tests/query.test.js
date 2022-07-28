const gql = require("graphql-tag");
const createTestServer = require("./helper");
const FEED = gql`
  {
    feed {
      id
      message
      createdAt
      likes
      views
    }
  }
`;

const ME = gql`
  {
    me {
      email
    }
  }
`;

describe("queries", () => {
  test("me", async () => {
    const { query } = await createTestServer();
    const res = await query({ query: ME });
    expect(res).toMatchSnapshot();
  });

  test("feed", async () => {
    const { query } = createTestServer({
      user: { id: 1 },
      models: {
        Post: {
          findMany: jest.fn(() => [
            {
              id: 1,
              message: "hello",
              createdAt: 12345839,
              likes: 20,
              views: 300,
            },
          ]),
        },
      },
    });

    const res = await query({ query: FEED });
    expect(res).toMatchSnapshot();
  });
});
