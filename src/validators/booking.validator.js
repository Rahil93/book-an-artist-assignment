import { check } from 'express-validator';

export const validateBookingReq = [
    check('event_start')
        .trim()
        .notEmpty()
        .withMessage('Event start date is required')
        .bail()
        .isDate({
            format: "YYYY-MM-DD",
            delimiter: "-",
            strictMode: true
        })
        .withMessage('Please enter a valid date in YYYY-MM-DD format')
        .bail()
        .custom((value, { req }) => {
            const today = new Date();
            console.log(new Date(value), today);
            if(new Date(value) < today) {
                throw new Error("Event start date must be the future date.");
            }
            return true
        })
        .bail()
        .custom((value, { req }) => {
            if(value > req.body.event_end) {
                throw new Error("Event start date must be before event end date");
            }
            return true
        }),
    check('event_end')
        .trim()
        .notEmpty()
        .withMessage('Event end date is required')
        .bail()
        .isDate({
            format: "YYYY-MM-DD",
            delimiter: "-",
            strictMode: true
        })
        .withMessage('Please enter a valid date in YYYY-MM-DD format')
        .bail()
        .custom((value, { req }) => {
            const today = new Date();
            if(new Date(value) < today) {
                throw new Error("Event end date must be the future date.");
            }
            return true
        })
        .bail()
        .custom((value, { req }) => {
            if(value < req.body.event_start) {
                throw new Error("Event end date must be after event start date");
            }
            return true
        }),
    check('artist_id')
        .trim()
        .notEmpty()
        .withMessage('Artist id is required'),
    check('notes')
        .trim()
        .notEmpty()
        .withMessage('Notes is required'),
]

export const validateBookingStatusReq = [
    check('status')
        .trim()
        .isIn(["pending", "confirmed", "cancelled", "completed", "in-progress"])
        .withMessage('Invalid transition of status'),
]