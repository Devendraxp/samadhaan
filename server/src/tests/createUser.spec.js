// import { createUser } from "../services/user.service.js";
import { loginUser } from "../services/auth.service.js";

const user = {
  email: "dev5@gmail.com",
  password: "tempPassword2",
};

await loginUser(user);
