module.exports = function (sequelize, DataTypes) {
  const KidIndex = sequelize.define(
    'KidIndex',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
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
      kid_index: {
        type: DataTypes.INTEGER,
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
      tableName: 'kid_index',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  return KidIndex;
};
