import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import {prismaClient} from "@repo/db/client"
import { SignUpSchema, SignInSchema, ForgotSchema } from "../types/type";
import { generateOTP, storeOTP } from "../util/otp";
import { sendOTPEmail } from "../util/send";

dotenv.config();

export const signUp = async (req: Request, res: Response) => {
    try {
       const parsedData = SignUpSchema.parse(req.body);
       if(!parsedData) {
        return res.status(400).json({ error: "Invalid data" });
       }
       const { username, password, name, image } = parsedData;
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = await prismaClient.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            image
        }
       });
       res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
};

export const signIn = async (req: Request, res: Response) => {
    try {
        const parsedData = SignInSchema.parse(req.body);
        if(!parsedData) {
            return res.status(400).json({ error: "Invalid data" });
        }
        const { username, password } = parsedData;
        const user = await prismaClient.user.findUnique({
            where: {
                username
            }
        });
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ username }, process.env.JWT_SECRET!);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Failed to sign in" });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const parsedData = ForgotSchema.safeParse(req.body);
    
        if (!parsedData.success) {
          return res.status(400).json({ message: "Invalid data" });
        }
    
        const email = parsedData.data.username;
        const user = await prismaClient.user.findFirst({
          where: {
            email,
          },
        });
    
        if (!user) {
          return res.status(403).json({ message: "Invalid Credentials" });
        }
    
        if (user) {
          const otp = generateOTP();
          storeOTP(email, otp);
          sendOTPEmail(email, otp);
        }
    
        return res.json({
          message:
            "if the user is registered,you will recive an OTP with in 5 Minute",
        });
      } catch (error) {
        res.status(500).json({
          message: "Internal server error",
        });
      }
};

export const getProfile = async (req: Request, res: Response) => {
    try {


        const user = await prismaClient.user.findUnique({
            where: {
                username: req.params.username
            },
            exclude:{
                password: true
            }


        });
    } catch (error) {
        res.status(500).json({ error: "Failed to get user profile" });
    }
};                                          
