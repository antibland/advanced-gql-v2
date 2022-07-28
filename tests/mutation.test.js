const gql = require("graphql-tag");
const createTestServer = require("./helper");
const UPDATE_USER_INPUT = gql`
  mutation {
    updateMe(input: { email: "some_new_email@email.com" }) {
      email
    }
  }
`;

describe("mutations", () => {
  test("update user input", async () => {
    const { mutate } = await createTestServer({
      user: { id: 1 },
      models: {
        User: {
          updateOne() {
            return {
              email: "some_new_email@email.com",
            };
          },
        },
        user: { id: 1 },
      },
    });
    const res = await mutate({ query: UPDATE_USER_INPUT });
    expect(res).toMatchSnapshot();
  });
});
