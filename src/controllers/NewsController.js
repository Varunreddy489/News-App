import vine, { errors } from "@vinejs/vine";

import prisma from "../db/db.config.js";
import { newsSchema } from "../validations/newsValidation.js";
import NewsApiTransform from "../transform/newsApiTransform.js";
import { generateRandomNumber, imageValidator, removeImage, uploadImage } from "../utils/helper.js";

class NewsController {

  static async index(req, res) {
    try {
      let page = Number(req.query.page) || 1;
      let limit = Number(req.query.limit) || 2;

      if (page <= 0) {
        page = 1;
      }

      if (limit <= 0 || limit > 100) {
        limit = 2;
      }

      const skip = (page - 1) * limit;

      const news = await prisma.news.findMany({
        take: limit,
        skip: skip,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });

      const newsTransform = news?.map((item) =>
        NewsApiTransform.transform(item)
      );

      const totalNews = await prisma.news.count();
      const totalPages = Math.ceil(totalNews / limit);

      return res.json({
        status: 200,
        news: newsTransform,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      });
    } catch (error) {
      console.error("error in index:", error);
      return res.status(400).json({ "Internal Server Error": error });
    }
  }

  static async store(req, res) {
    try {
      const user = req.user;
      const body = req.body;

      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          errors: {
            image: "Image field is required.",
          },
        });
      }

      const image = req.files?.image;

      //* Image custom validator
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          errors: {
            image: message,
          },
        });
      }

      // * upload Image
      const imgExt = image?.name.split(".");
      const imgName = generateRandomNumber() + "." + imgExt[1];
      const uploadPath = process.cwd() + "/public/images/" + imgName;

      image.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      payload.image = imgName;
      payload.user_id = user.id;

      const news = await prisma.news.create({
        data: payload,
      });

      return res.status(200).json({ news });
    } catch (error) {
      console.error("error in store:", error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });

      const transformNews = news ? NewsApiTransform.transform(news) : null;

      return res.json({ status: 200, news: transformNews });
    } catch (error) {
      console.error("error in index:", error);
      return res.status(400).json({ "Internal Server Error": error });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;
      
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (user.id !== news.user_id) {
        return res.status(400).json({ message: "UnAtuhorized" });
      }
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);
      const image = req?.files?.image;

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message,
            },
          });
        }

        //   * Upload new image
        const imageName = uploadImage(image);
        payload.image = imageName;
        // * Delete old image
        removeImage(news.image);
      }

      await prisma.news.update({
        data: payload,
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({ message: "News updated successfully!" });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (user.id !== news?.user_id) {
        return res.status(401).json({ message: "Un Authorized" });
      }

      // * Delete image from filesystem
      removeImage(news.image);
      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });
      return res.json({ message: "News deleted successfully!" });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }
}

export default NewsController;
