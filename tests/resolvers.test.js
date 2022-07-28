const resolvers = require("../src/resolvers");

describe("resolvers", () => {
  test("feed", async () => {
    const result = resolvers.Query.feed(null, null, {
      models: {
        Post: {
          findMany() {
            return ["hello"];
          },
        },
      },
    });

    expect(result).toEqual(["hello"]);
  });
});
