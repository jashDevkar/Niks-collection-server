import bcrypt from "bcryptjs";
import db from "../db.js"; // supabase client
import jwt from "jsonwebtoken";

/**
 * Verify token sent in headers.
 * Accepts token in `req.headers.token` or `Authorization: Bearer <token>`.
 */
export async function verifyUser(req, res) {
  try {
    const {token} = req.headers; 
     

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ message: "user logged in", user: decoded });
  } catch (error) {
    
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

 
    const { data: existingUser, error: checkError } = await db
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Supabase check error:", checkError);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

 
    const { data: insertedUser, error: insertError } = await db
      .from("users")
      .insert([{ email, password: hashedPassword }])
      .select()
      .single();

    if (insertError) {
      
      return res.status(500).json({ message: "Failed to create user" });
    }

    const token = jwt.sign(
      { id: insertedUser.id, email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("signupController error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
