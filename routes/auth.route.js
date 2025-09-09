import express from 'express';
import { getTokenAndUserData, loginController, resendOtp, signupController, verifyOtpController, verifyUser } from '../controllers/authController.js';



const authRouter = express.Router();


authRouter.post("/login",loginController);
authRouter.post("/signup",signupController);
authRouter.post("/verify-otp", verifyOtpController);
authRouter.post("/resend-otp",resendOtp);
authRouter.post("/getTokenAndUserData",getTokenAndUserData)

authRouter.get("/verify-user",verifyUser);






export default authRouter;