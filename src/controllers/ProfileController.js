import prisma from "../db/db.config.js";
import { generateRandomNumber, imageValidator } from "../utils/helper.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.json({ status: 200, user });
    } catch (error) {
      console.error("error in index:", error);
      return res.status(400).json({ "Internal Server Error": error });
    }
  }

  static async store() {}
  static async show() {}

  static async update(req, res) {
    try {
      const { id } = req.params;
      const authUser = req.user;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "Profile Image is required" });
      }

      const profile = req.files.profile;
      const message = imageValidator(profile?.size, profile?.mimetype);

      if (message !== null) {
        return res.status(400).json({ errors: { profile: message } });
      }

      const imgExt = profile?.name.split(".");
      const imgName = generateRandomNumber() + "." + imgExt[1];
      const uploadPath = process.cwd() + "/public/images/" + imgName;

      profile.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      await prisma.users.update({
        data: {
          profile: imgName,
        },
        where: {
          id: Number(id),
        },
      });
      return res.json({
        status: 200,
        message: "Profile updated Successfully",
      });
    } catch (error) {
      console.error("error in update:", error);
      return res.status(400).json({ "Internal Server Error": error });
    }
  }

  static async destroy() {}
}

export default ProfileController;
