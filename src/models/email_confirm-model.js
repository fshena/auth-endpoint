
module.exports = (sequelize, DataTypes) => {
    const emailConfirm = sequelize.define('EmailConfirm', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        expires: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
        tableName: 'email_confirm',
        underscored: true,
    });
    return emailConfirm;
};
