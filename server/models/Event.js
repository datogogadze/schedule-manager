const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
  const Event = sequelize.define(
    'Event',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      board_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      kid_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recurrence_pattern: {
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
      tableName: 'events',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  Event.associate = function (models) {
    Event.belongsTo(models.Board, {
      foreignKey: 'board_id',
    });
  };

  Event.associate = function (models) {
    Event.belongsTo(models.User, {
      foreignKey: 'kid_id',
    });
  };

  return Event;
};
