const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      display_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      password_hash: {
        type: DataTypes.STRING,
      },
      image_url: {
        type: DataTypes.STRING(128),
      },
      external_type: {
        type: DataTypes.STRING,
      },
      external_id: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
      },
    },
    {
      tableName: 'users',
      underscored: true,
    }
  );
};
