const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out.');
    res.redirect('/');
}

exports.mustBeLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
        return;
    }
    req.flash('warning', 'You must be logged in.');
    res.redirect('/login');
}

exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        req.flash('error', 'If your account exists you would get an email');
        res.redirect('/login');
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); //Create a password token
    user.resetPasswordExpires = Date.now() + 3600000; //Password token expires in an hour
    await user.save();

    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    req.flash('success', `You have been emailed a password reset link. ${resetURL}`);
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    const user = await User.findOne({ 
        resetPasswordToken: req.params.token, 
        resetPasswordExpires: {$gt: Date.now()} 
    });

    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        res.redirect('/login');
        return;
    }

    res.render('reset', {title: 'Reset your password'});
}

exports.confirmPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm'] && req.body.password !== '') {
        next();
        return;
    }
    req.flash('error', 'Passwords do not match');
    res.redirect('back');
}

exports.updatePassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        res.redirect('/login');
        return;
    }

    await user.setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', 'The password has been reset');
    res.redirect('/');
}