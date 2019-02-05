const mongoose = require('mongoose');
//We can reference the store directly
//anywhere in our application because we imported it in the start.js file
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
    res.render('Hello');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

exports.createStore = async (req, res) => {
    const store = new Store(req.body);
    await store.save();
    res.flash('success', `${store.name} Store created successfully. Care to leave a review?`)
    res.redirect('/');
}