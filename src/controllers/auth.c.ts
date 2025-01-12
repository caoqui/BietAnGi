import bcrypt from "bcrypt";
import jwt, { verify } from "jsonwebtoken";
import { Request, Response } from "express";
import { getRepository, getManager } from "typeorm";
import { User } from "../entities";
const { v4: uuidv4 } = require("uuid");
import redis from "../config/redis";
import UserRepository from "../repository/user";
// import Cache from "../config/node-cache"

require("dotenv").config({ path: "./server/.env" });

let refreshTokens: string[] = [];

const authController: any = {
  // generate JWT_ACCESS_TOKEN
  generateAccessToken: (user: { id: string }) => {
    return jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_ACCESS_KEY as string,
      { expiresIn: "2h" }
    );
  },

  // generate JWT_REFRESH_TOKEN
  generateRefreshToken: (user: { id: string }) => {
    return jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_REFRESH_KEY as string,
      { expiresIn: "14d" }
    );
  },

  // [POST] /register
  registerUser: async (req: Request, res: Response) => {
    let user = new User();
    const { username, password, fullname } = req.body;
    user.username = username;
    user.password = password;
    user.fullname = fullname;
    user.avatar = `https://avatar.iran.liara.run/username?username=${user.fullname}`;

    try {
      if (!user.username || !user.password || !user.fullname || user.fullname.length > 20) {
        return res.status(400).json("Định dạng dữ liệu của bạn chưa chính xác.");
      }

      const userDb = await UserRepository.getProfileByUsername(user.username);

      if (userDb && userDb.id) {
        return res.status(401).json("username này đã tồn tại, hãy thử đăng nhập.");
      }

      // add new user to db - Account
      user.id = await uuidv4();
      const salt = await bcrypt.genSalt(11);
      user.password = await bcrypt.hash(user.password, salt);
      const userSave = await UserRepository.registerUser(user);

      return res.status(201).json({ data: userSave });
    } catch (error: any) {
      return res.status(500).json(error.msg || "Hệ thống lỗi, vui lòng thử lại sau.");
    }
  },

  googleAuth: async (req: Request, res: Response) => {
    const profile: any = req.user;
    console.log(profile);

    try {
      if (!profile || !profile.id || !profile.google)
        return res.status(400).json("Dữ liệu tài khoản google không hợp lệ.")

      const accessToken = await authController.generateAccessToken({ id: profile.id });
      const refreshToken = await authController.generateRefreshToken({ id: profile.id });
      const { username, password, ...other } = profile;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      return res.status(200).json({
        refreshToken,
        user: other,
        accessToken,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json("Hệ thống lỗi, vui lòng thử lại sau.");
    }
  },

  // [POST] /login
  loginUser: async (req: any, res: any) => {
    const username: string = req.body.username;
    const passwordInput: string = req.body.password;

    if (!username || !passwordInput || typeof username !== "string" || typeof passwordInput !== "string")
      return res.status(400).json("Username hoặc password chưa chính xác.");

    try {
      // get user from database
      const userDb = await UserRepository.getProfileByUsername(username)
      if (!userDb || !userDb.password)
        return res.status(400).json("Username hoặc password chưa chính xác.");

      const validPassword = await bcrypt.compare(
        passwordInput,
        userDb.password
      );
      if (!validPassword)
        return res.status(400).json("Username hoặc password chưa chính xác.");

      const accessToken = await authController.generateAccessToken({ id: userDb.id });
      const refreshToken = await authController.generateRefreshToken({ id: userDb.id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      const { password, ...others } = userDb;

      return res.status(200).json({
        refreshToken,
        user: others,
        accessToken,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json("Hệ thống lỗi, vui lòng thử lại sau.");
    }
  },

  // [POST] /refresh
  requestRefreshToken: async (req: any, res: any) => {
    const id = req.user;
    const newAccessToken = authController.generateAccessToken({id})

    return res.status(201).json({
      accessToken: newAccessToken
    });
  }

};

export default authController;