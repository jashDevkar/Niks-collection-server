import express from 'express';
import { loginController, signupController, verifyOtpController, verifyUser } from '../controllers/authController.js';



const authRouter = express.Router();


authRouter.post("/login",loginController);
authRouter.post("/signup",signupController);
authRouter.post("/verify-otp", verifyOtpController);


authRouter.get("/verify-user",verifyUser);





export default authRouter;