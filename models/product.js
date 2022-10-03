const fs = require('fs');
const path = require('path');
const Cart = require('../models/cart');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save = () => {
    getProductsFromFile(products => {
      const updatedProducts = [...products];
      if (this.id) {
          const existingProductIndex = products.findIndex(prod => prod.id === this.id);
          console.dir(existingProductIndex);
          updatedProducts[existingProductIndex] = this;
      } else {
          this.id = Math.random().toString();
           updatedProducts.push(this);
      }
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        console.log(err);
      });
    });
  }

  static fetchAll = (cb) => {
    getProductsFromFile(cb);
  };

  static findById = (id, cb) => {
    getProductsFromFile(products => {
      cb(products.filter(prod => prod.id === id)[0]);
    });
  };

  static deleteById = (id, cb) => {
    getProductsFromFile((products) => {
      const updatedProducts = products.filter(prod => prod.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        console.log(err);
        if (!err) {
          Cart.deleteProduct(id);
          cb('ok');
        } else {
          cb('failed');
        }
      });
    });
  }
};
