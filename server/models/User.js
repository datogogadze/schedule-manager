module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING(256),
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
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  User.associate = function (models) {
    User.belongsToMany(models.Board, {
      through: 'UserBoard',
      as: 'boards',
      foreignKey: 'user_id',
    });
  };

  return User;
};
