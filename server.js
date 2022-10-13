const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const sequelize = require('./util/database');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart_item');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        console.dir(user);
        req.user = user;
        next();
    }).catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Cart.hasMany(CartItem);

sequelize.sync({force: true}).then(result => {
    return User.findByPk(1);
}).then(user => {
    if (!user) {
        return User.create({ name: 'Maja', email: 'test@test.com'});
    }
    return user;
}).then(user => {
    // console.log(user);
    return user.createCart();
}).then(cart => {
    app.listen(3000);
}).catch(err => {
    console.log(err);
});