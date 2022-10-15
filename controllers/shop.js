const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
      .then((products) => {
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'All Products',
          path: '/products'
        });
      })
      .catch((err) => {
        console.log(err);
      });
};

exports.getProductById = (req, res, next) => {
  const id = req.params.productId;
  Product.findByPk(id)
      .then((product) => {
            res.render('shop/product-detail', {
              product,
              pageTitle: product.title,
              path: '/products'
            });
      })
      .catch((err) => {
        console.log(err);
      });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
      .then((products) => {
        console.dir(products);
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'All Products',
          path: '/products'
        });
      })
      .catch((err) => {
        console.log(err);
      });
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
      .then((cart) => {
         return cart.getProducts().then(products => {
           res.render('shop/cart', {
             path: 'cart',
             pageTitle: 'Your Cart',
             products,
           })
     });
    }).catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  req.user.getCart().then(cart => {
      return cart.getProducts({ where: { id: productId }});
  }).then(products => {
      const product = products[0];
      return product.cartItem.destroy();
  }).then(result => res.redirect('/cart'));
};

exports.addToCart = (req, res, next) => {
    const { productId } = req.body;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then((cart) => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then((products) => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
               newQuantity = product.cartItem.quantity + 1;
               return product;
            }
            return Product.findByPk(productId);
        }).then((product) => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } } );
        }).then(() => {
            res.redirect('/cart');
        });
};

exports.postOrder = (req, res, next) => {
    const { user } = req;
    let fetchedCart;
    user.getCart().then((cart) => {
        fetchedCart = cart;
        return cart.getProducts();
    }).then((products) => {
        return req.user.createOrder().then((order) => {
            order.addProducts(products.map((product) => {
                product.orderItem = {
                    quantity: product.cartItem.quantity
                };
                return product;
            }));
        });
    }).then(() => {
        return fetchedCart.setProducts(null);
    }).then(() => {
        res.redirect('/orders');
    }).catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({ include: ['products']} ).then((orders) => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders
        });
    }).catch((err) => console.log(err));
};
