module.exports = function (sequelize, DataTypes) {
  const UserDevice = sequelize.define(
    'UserDevice',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      device_token: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      logged_in: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      session_expires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: 'user_device',
      underscored: true,
    }
  );

  return UserDevice;
};
