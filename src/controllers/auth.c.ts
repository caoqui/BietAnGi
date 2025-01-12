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

      return res.status(201).json({data: userSave});
    } catch (error: any) {
      return res.status(500).json(error.msg||"Hệ thống lỗi, vui lòng thử lại sau.");
    }
  },

  googleAuth: async (req: Request, res: Response) => {
    const userIdAccount: any = req.headers["userId"];

  },

  // [POST] /login
  loginUser: async (req: any, res: any) => {
    const username = req.body.username;
    const passwordInput = req.body.password;
    const androidFcmToken = req.body.androidFcmToken;

    if (username === undefined || passwordInput === undefined) {
      return res.json({
        status: "failed",
        msg: "Missing required input data",
      });
    }

    if (typeof username !== "string" || typeof passwordInput !== "string") {
      return res.json({
        status: "failed",
        msg: "Invalid data types for input (username should be string, password should be string)",
      });
    }

    try {
      // get user from database
      const userRepository = getRepository(User);
      const userDb = await userRepository.findOne({
        where: { username: username },
      });

      if (userDb == null) {
        return res.json({
          status: "failed",
          msg: "Username or password is incorect.",
        });
      }

      const validPassword = await bcrypt.compare(
        passwordInput,
        userDb.password
      );

      if (!validPassword) {
        return res.json({
          status: "failed",
          msg: "Username or password is incorect.",
        });
      }
      const { accessToken, refreshToken } = await authController.genToken(
        userDb
      );

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      const { password, ...others } = userDb;

      return res.json({
        refreshToken,
        user: others,
        accessToken,
        status: "success",
        msg: "login successfully!",
      });
    } catch (error) {
      // console.log(error);
      res.json({ status: "failed", msg: "login failure." });
    }
  },

  // [POST] /refresh
  requestRefreshToken: async (req: any, res: any) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.json({ status: "failed", msg: "401 Unauthorized!" });

    // check if we have a refresh token but it isn't our refresh token
    if (!refreshTokens.includes(refreshToken)) {
      return res.json({ status: "failed", msg: "403 Forbidden!" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_KEY as string,
      (err: any, user: any) => {
        if (err) {
          console.log(err);
        }
        user.user_id = user.userId;
        // create new JWT_ACCESS_TOKEN
        const newAccessToken = authController.generateAccessToken(user);

        return res.json({
          accessToken: newAccessToken,
          refreshToken: refreshToken,
        });
      }
    );
  },

  // [POST] /logout
  // logoutUser: async (req: Request, res: Response) => {
  //   refreshTokens = refreshTokens.filter(
  //     (token) => token !== req.cookies.refreshToken
  //   );
  //   res.clearCookie("refreshToken");
  //   res.json("Logged out successfully!");
  // },
};

export default authController;