import express from 'express';
import { loginController, signupController, verifyUser } from '../controllers/authController.js';



const authRoute = express.Router();


authRoute.post("/login",loginController);
authRoute.post("/signup",signupController);


authRoute.get("/verify-user",verifyUser);





export default authRoute;