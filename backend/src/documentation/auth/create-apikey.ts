import { auth } from "@/lib/auth";

const loginOrRegister = async () => {
  const data = await auth.api
    .signInEmail({
      body: {
        email: "john.doe@example.com", // required
        password: "password1234", // required
      },
    })
    .catch(async () => {
      return await auth.api.signUpEmail({
        body: {
          name: "John Doe", // required
          email: "john.doe@example.com", // required
          password: "password1234", // required
          image: "https://example.com/image.png",
          callbackURL: "https://example.com/callback",
        },
      });
    });
  return data.user;
};

const createApiKey = async () => {
  const user = await loginOrRegister();
  console.log("User logged in or registered:", user);
  const apiKeyData = await auth.api.createApiKey({
    body: {
      name: "My First API Key", // required
      userId: user.id, // required
    },
  });
  console.log("API Key created:", apiKeyData);
};
createApiKey();
