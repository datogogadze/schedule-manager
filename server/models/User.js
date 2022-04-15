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
      },
    },
    {
      tableName: 'users',
    }
  );
};
