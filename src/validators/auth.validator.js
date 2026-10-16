import { check } from 'express-validator';
export const validateSignInUser = [
    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .bail()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    check('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
];