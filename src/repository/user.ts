import { User } from "../entities/User";
import { getRepository } from "typeorm";
const cloudinary = require("cloudinary").v2;

const UserRepository = {
    async getProfileByUsername(username: string) {
        const userRepository = getRepository(User);
    
        try {
          const userDb = await userRepository.findOneOrFail({
            where: { username: username},
          });
          const { password, ...others } = userDb;
    
          return userDb;
        } catch (error) {
          console.log(error);
          return null;
        }
      },

      async registerUser(data: any) {
        try {
          const userRepository = getRepository(User);
          const userĐb = await userRepository.save(data);
    
          return userĐb;
        } catch (error) {
          throw new Error("Đăng ký thất bại, vui lòng thử lại.")
        }
      },
};

export default UserRepository;