module.exports = function (sequelize, DataTypes) {
  const Exclusion = sequelize.define(
    'Exclusion',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      event_id: {
        type: DataTypes.UUID,
        defaultValue: null,
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
      exclusion_timestamp: {
        type: DataTypes.DATE,
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
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
      tableName: 'exclusions',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  Exclusion.associate = function (models) {
    Exclusion.belongsTo(models.Board, {
      foreignKey: 'board_id',
    });
  };

  Exclusion.associate = function (models) {
    Exclusion.belongsTo(models.User, {
      foreignKey: 'kid_id',
    });
  };

  return Exclusion;
};
