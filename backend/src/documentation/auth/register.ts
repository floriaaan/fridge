import { auth } from "@/lib/auth";

const register = async () => {
  const data = await auth.api.signUpEmail({
    body: {
      name: "John Doe", // required
      email: "john.doe@example.com", // required
      password: "password1234", // required
      image: "https://example.com/image.png",
      callbackURL: "https://example.com/callback",
    },
  });
  console.log("User registered:", data.user);
};
register();
