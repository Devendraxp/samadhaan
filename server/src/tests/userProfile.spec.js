import { findUserById } from "../services/user.service.js";


const userId="3c200c50-230d-4118-975b-b0c74acd4023";

const user = await findUserById(userId);

console.log(user);