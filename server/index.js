const express = require("express");
const cors = require("cors");
const { Collection, Media, sequelize } = require("./groups/schema");
const { createClient } = require("redis");
const rateLimit = require("express-rate-limit");
const short = require("short-uuid");
const { Op } = require("sequelize");
const app = express();
const PORT = process.env.PORT || 8080;
const translator = short();

app.use(cors());
app.use(express.json());

sequelize.options.pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

sequelize
  .authenticate()
  .then(() => console.log("Database connection established."))
  .catch((err) => console.error("Database connection error:", err));

const redisClient = createClient({
  password: "ERxsssYrj12bsC5nLZG2T1VdMcReKPkT",
  socket: {
    host: "redis-15112.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 15112,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));
redisClient.on("ready", () => console.log("Redis Client Ready"));

redisClient.connect().catch(console.error);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", apiLimiter);

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An unexpected error occurred" });
};

const cache = async (req, res, next) => {
  const key = `__express__${req.originalUrl || req.url}`;
  const cachedBody = await redisClient.get(key);
  if (cachedBody) {
    return res.send(JSON.parse(cachedBody));
  }
  res.sendResponse = res.send;
  res.send = (body) => {
    redisClient.set(key, JSON.stringify(body), { EX: 60 });
    res.sendResponse(body);
  };
  next();
};

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is live." });
});

app.get("/api/hot", cache, async (req, res, next) => {
  try {
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : 0;
    const limit = 20;

    const hotContent = await Media.findAll({
      attributes: ["id", "previewUrl", "title"],
      include: [
        {
          model: Collection,
          attributes: ["id", "title", "imageUrl", "slug"],
          required: true,
        },
      ],
      order: sequelize.random(),
      limit: limit + 1,
      offset: cursor,
    });

    const hasMore = hotContent.length > limit;
    if (hasMore) hotContent.pop();

    const response = {
      media: hotContent.map((item) => ({
        id: item.id,
        previewUrl: item.previewUrl,
        title: item.title,
        collection: {
          id: item.Collection.id,
          title: item.Collection.title,
          slug: item.Collection.slug,
          imageUrl: item.Collection.imageUrl,
        },
      })),
      nextCursor: hasMore ? cursor + limit : null,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.get("/api/ai-images", cache, async (req, res, next) => {
  try {
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : 0;
    const limit = 20;

    const AiImages = await Media.findAll({
      attributes: ["id", "previewUrl", "title"],
      include: [
        {
          model: Collection,
          required: true,
          where: {
            productionType: "ai",
          },
        },
      ],
      order: sequelize.random(),
      limit: limit + 1,
      offset: cursor,
    });

    const hasMore = AiImages.length > limit;
    if (hasMore) AiImages.pop();

    const response = {
      media: AiImages.map((item) => ({
        id: item.id,
        previewUrl: item.previewUrl,
        title: item.title,
        collection: {
          id: item.Collection.id,
          title: item.Collection.title,
          slug: item.Collection.slug,
          imageUrl: item.Collection.imageUrl,
        },
      })),
      nextCursor: hasMore ? cursor + limit : null,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.get("/api/top-groups", cache, async (req, res, next) => {
  try {
    const topgroups = await Collection.findAll({
      attributes: ["id", "title", "imageUrl", "slug"],
      order: [["views", "DESC"]],
      limit: 20,
    });

    res.json(topgroups);
  } catch (error) {
    next(error);
  }
});

app.post("/api/search", apiLimiter, async (req, res) => {
  try {
    const { query } = req.body;
    if (query === undefined || query === null) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const collections = await Collection.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`,
        },
      },
      attributes: ["id", "title", "slug", "imageUrl", "views"],
      limit: 20,
    });

    const formattedCollections = collections.map((collection) => ({
      id: translator.fromUUID(collection.id),
      title: collection.title,
      slug: collection.slug,
      imageUrl: collection.imageUrl,
      views: collection.views,
    }));

    res.json({ collections: formattedCollections });
  } catch (error) {
    console.error("Error in search endpoint:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred during search" });
  }
});

app.get("/api/collection/:name/profile", cache, async (req, res, next) => {
  try {
    const name = req.params.name;

    const collection = await Collection.findOne({
      where: { title: name },
      attributes: [
        "id",
        "title",
        "description",
        "imageUrl",
        "views",
        "totalItems",
      ],
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const viewsKey = `collection_views:${collection.id}`;
    await redisClient.incr(viewsKey);

    const redisViews = await redisClient.get(viewsKey);
    const totalViews = parseInt(collection.views) + parseInt(redisViews || 0);

    res.json({
      ...collection.toJSON(),
      views: totalViews,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/collection/:slug/media", cache, async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      return res.status(400).json({ error: "Collection slug is required" });
    }

    const cursor = req.query.cursor ? parseInt(req.query.cursor) : 0;
    const limit = 20;

    const collection = await Collection.findOne({
      where: { slug: slug },
      attributes: ["id"],
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const media = await Media.findAll({
      where: { collectionId: collection.id },
      attributes: ["id", "previewUrl"],
      order: [["createdAt", "DESC"]],
      limit: limit + 1,
      offset: cursor,
    });

    const hasMore = media.length > limit;
    if (hasMore) media.pop();

    res.json({
      media,
      nextCursor: hasMore ? cursor + limit : null,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/media/:id", cache, async (req, res, next) => {
  try {
    const decodedId = translator.toUUID(req.params.id);

    const media = await Media.findByPk(decodedId, {
      attributes: ["id", "mediaUrl", "views", "collectionId"],
      include: [
        {
          model: Collection,
          attributes: ["title"],
        },
      ],
    });

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    const additionalMedia = await Media.findAll({
      where: { collectionId: media.collectionId },
      attributes: ["id", "previewUrl"],
      limit: 20,
      order: sequelize.random(),
    });

    const viewsKey = `media_views:${decodedId}`;
    await redisClient.incr(viewsKey);
    const redisViews = await redisClient.get(viewsKey);

    const totalViews = parseInt(media.views) + parseInt(redisViews || 0);

    res.json({
      ...media.toJSON(),
      views: totalViews,
      collectionTitle: media.Collection.title,
      additionalMedia: additionalMedia.map((item) => ({
        id: translator.fromUUID(item.id),
        previewUrl: item.previewUrl,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/collections", cache, async (req, res) => {
  try {
    const cursor = parseInt(req.query.cursor) || 0;
    const limit = 20;
    const subquery = `(
      SELECT "mediaId", "collectionId", "previewUrl"
      FROM (
        SELECT "id" as "mediaId", "collectionId", "previewUrl",
               ROW_NUMBER() OVER (PARTITION BY "collectionId" ORDER BY "views" DESC) as rn
        FROM "Media"
      ) ranked
      WHERE rn = 1
    )`;

    const collections = await sequelize.query(
      `
      SELECT c.id, c.title, c.slug, c."imageUrl", c.views, 
             m."mediaId" as "mostViewedMediaId", m."previewUrl" as "mostViewedMediaPreviewUrl"
      FROM "Collections" c
      LEFT JOIN ${subquery} m ON c.id = m."collectionId"
      ORDER BY c.views DESC
      LIMIT :limit OFFSET :offset
    `,
      {
        replacements: { limit: limit + 1, offset: cursor },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const formattedCollections = collections
      .slice(0, limit)
      .map((collection) => ({
        id: collection.id,
        title: collection.title,
        slug: collection.slug,
        imageUrl: collection.imageUrl,
        views: collection.views,
        mostViewedMedia: collection.mostViewedMediaId
          ? {
              id: collection.mostViewedMediaId,
              previewUrl: collection.mostViewedMediaPreviewUrl,
            }
          : null,
      }));

    const hasMore = collections.length > limit;
    const nextCursor = hasMore ? cursor + limit : null;

    res.json({
      collections: formattedCollections,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error in /api/collections:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching collections" });
  }
});

const updateViewCounts = async () => {
  const collectionKeys = await redisClient.keys("collection_views:*");
  for (const key of collectionKeys) {
    const collectionId = key.split(":")[1];
    const views = await redisClient.get(key);
    await Collection.increment("views", {
      by: parseInt(views),
      where: { id: collectionId },
    });
    await redisClient.del(key);
  }

  const mediaKeys = await redisClient.keys("media_views:*");
  for (const key of mediaKeys) {
    const mediaId = key.split(":")[1];
    const views = await redisClient.get(key);
    await Media.increment("views", {
      by: parseInt(views),
      where: { id: mediaId },
    });
    await redisClient.del(key);
  }
};

app.get("/api/collection-names", async (req, res) => {
  const names = await Collection.findAll({
    attributes: ["title"],
  });
  return res.json(names);
});

setInterval(updateViewCounts, 60 * 60 * 1000);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
