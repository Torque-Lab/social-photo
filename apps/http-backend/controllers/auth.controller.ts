import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { SignUpSchema, SignInSchema, ForgotSchema, ResetSchema } from "../types/type";
import { generateOTP, isOTPValid, storeOTP } from "../util/otp";
import { sendOTPEmail } from "../util/send";
import { handleError, hashPassword, userSelectFields } from "../util/controller.utils";

dotenv.config();

export const signUp = async (req: Request, res: Response) => {
    try {
       const parsedData = SignUpSchema.parse(req.body);
       if(!parsedData) {
         res.status(400).json({ error: "Invalid data" });
         return;
       }
       const { username, password, name, image } = parsedData;
       const hashedPassword = await hashPassword(password);
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
         handleError(res, error, "Failed to create user");
    }
};

export const signIn = async (req: Request, res: Response) => {
    try {
        const parsedData = SignInSchema.parse(req.body);
        if(!parsedData) {
            res.status(400).json({ error: "Invalid data" });
            return;
        }
        const { username, password } = parsedData;
        const user = await prismaClient.user.findUnique({
            where: {
                username
            }
        });
        if(!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            res.status(401).json({ error: "Invalid password" });
            return;
        }
        const token = jwt.sign({ userId: username }, process.env.JWT_SECRET!,{ expiresIn: '4h' });
        res.status(200).json({ token });
    } catch (error) {
       handleError(res, error, "Failed to sign in");
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const parsedData = ForgotSchema.safeParse(req.body);
    
        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid data" });
            return;
        }
    
        const email = parsedData.data.username;
        const user = await prismaClient.user.findFirst({
          where: {
            username: email,
          },
        });
    
        if (!user) {
            res.status(403).json({ message: "Invalid Credentials" });
            return;
        }
    
        if (user) {
          const otp = generateOTP();
          storeOTP(email, otp);
          sendOTPEmail(email, otp);
        }
    
        res.status(200).json({
          message:
            "if the user is registered,you will recive an OTP with in 5 Minute",
        });
      } catch (error) {
         handleError(res, error, "Internal server error");
         return;
      }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const parsedData = ResetSchema.safeParse(req.body);
    
        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid data" });
            return;
        }
    
        const { username, otp, newPassword } = parsedData.data;

        const isValidOTP = isOTPValid(username, otp);
    
        if (!isValidOTP) {
          res.status(403).json({ message: "Invalid OTP" });
          return;
        }
    
        const user = await prismaClient.user.findFirst({
          where: {
            username: username,
          },
        });
    
        if (!user) {
          res.status(403).json({ message: "Invalid Credentials" });
          return;
        }
    
        const hashedPassword = await hashPassword(newPassword);
        await prismaClient.user.update({
            where: { username },
            data: { password: hashedPassword },
        });
    
         res.json({ message: "Password reset successfully" });
    } catch (error) {
        handleError(res, error, "Internal server error");
    }
};  

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await prismaClient.user.findUnique({
            where: {
                username: req.params.username
            },
            select: userSelectFields
        });
        
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
         res.status(200).json(user);
    } catch (error) {
         handleError(res, error, "Failed to get user profile");
    }
};
