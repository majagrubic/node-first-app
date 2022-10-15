const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Order_item = sequelize.define('orderItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    quantity: Sequelize.INTEGER,
});

module.exports = Order_item;