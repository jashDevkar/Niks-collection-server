import bcrypt from "bcryptjs";
import db from "../db.js"; // supabase client
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { sendVerificationEmail } from "../utils/email.js";


/// verify user when first entered and user is loged in
export async function verifyUser(req, res) {
  try {
    const { token } = req.headers;


    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ message: "user logged in", user: decoded });
  } catch (error) {

    return res.status(401).json({ message: "Invalid or expired token" });
  }
}





///login user
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const { data: user, error: selectError } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("Supabase select error:", selectError);
      return res.status(500).json({ message: "Database error" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    if (!user.password) {
      return res.status(400).json({ message: "Please sign in with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: user.email,
    });
  } catch (error) {

    return res.status(500).json({ message: "Server error" });
  }
}






export async function signupController(req, res) {
  try {
    const { name, email, password } = req.body;


    console.log(name,email,password);
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { data: existingUser } = await db
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: insertedUser, error: insertError } = await db
      .from("users")
      .insert([{ name, email, password: hashedPassword }])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.from("user_otps").insert([
      {
        user_id: insertedUser.id,
        otp_code: otp,
        otp_expires_at: expiresAt.toISOString(),
      },
    ]);

    // Send OTP email
    await sendVerificationEmail(email, otp);

    return res.status(201).json({
      message: "User registered. Please verify OTP sent to your email.",
      userId: insertedUser.id,
    });
  } catch (error) {
    console.error("signupController error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}





export async function verifyOtpController(req, res) {
  try {
    const { userId, otp } = req.body;

    

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const { data: otpEntry } = await db
      .from("user_otps")
      .select("*")
      .eq("user_id", userId)
      .eq("otp_code", otp)
      .eq("used", false)
      .maybeSingle();

    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (new Date(otpEntry.otp_expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark OTP as used
    await db
      .from("user_otps")
      .update({ used: true })
      .eq("id", otpEntry.id);

    // Mark user email as verified
    await db
      .from("users")
      .update({ email_verified: true })
      .eq("id", userId);

    // Generate JWT
    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error("verifyOtpController error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
