const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../", "database.sqlite"),
  logging: false,
});

const Collection = sequelize.define("Collection", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9_\-.]+$/i,
    },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  contentRating: {
    type: DataTypes.ENUM("soft", "mature"),
    allowNull: false,
    defaultValue: "soft",
  },
  productionType: {
    type: DataTypes.ENUM("real", "ai"),
    allowNull: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
});

const Media = sequelize.define("Media", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  collectionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mediaType: {
    type: DataTypes.ENUM("image", "video", "gif"),
    allowNull: false,
  },
  mediaUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  previewUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fileHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Duration in seconds, for video content",
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
});

Collection.hasMany(Media, { foreignKey: "collectionId" });
Media.belongsTo(Collection, { foreignKey: "collectionId" });

module.exports = { sequelize, Collection, Media };
