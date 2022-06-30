const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
  const Board = sequelize.define(
    'Board',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        primaryKey: true,
      },
      creator_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image_url: {
        type: DataTypes.STRING(256),
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
      tableName: 'boards',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  Board.associate = function (models) {
    Board.belongsToMany(models.User, {
      through: 'UserBoard',
      as: 'users',
      foreignKey: 'board_id',
    });
  };

  return Board;
};
