const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  console.dir(req.user);
  req.user.createProduct({ title, imageUrl, price, description })
      .then(() => { res.redirect('/admin/products'); })
      .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user.getProducts({where: {id: prodId}}).then((products) => {
    const product = products[0];
    if (!product) {
      return res.redirect('/');
    }
    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: editMode,
      product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const { title, price, imageUrl, description } = req.body;
  const prod = Product.findByPk(prodId).then((product) => {
    product.set({ title, price, imageUrl, description});
    return product.save();
  });
  prod.then(() => {
      res.redirect('/admin/products');
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId).then((product) => {
    return product.destroy();
  }).then(() => {
    res.redirect('/admin/products');
  })
};

exports.getProducts = (req, res, next) => {
  req.user
      .getProducts()
      .then((products) => {
        res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products'
        });
      })
      .catch((err) => console.log(err));
};
