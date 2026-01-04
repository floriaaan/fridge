import { auth } from "@/lib/auth";

const login = async () => {
  const data = await auth.api.signInEmail({
    body: {
      email: "john.doe@example.com", // required
      password: "password1234", // required
    },
  });
  console.log("User logged in:", data.user);
};
login();
