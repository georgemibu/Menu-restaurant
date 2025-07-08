// backend/models/product.js
module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: DataTypes.TEXT,
        price: DataTypes.FLOAT,
        category: DataTypes.STRING,
        imageUrl: {
            type: DataTypes.STRING, // o DataTypes.TEXT
            allowNull: true,
        },
    });

    Product.associate = function (models) {
        // tus asociaciones si las tenés
    };

    return Product;
};
