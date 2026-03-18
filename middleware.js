const Joi = require("joi");

    const schema = Joi.object({
originalUrl: Joi.string().max(1000).uri().required(),
        alias: Joi.string().allow(null).allow('').min(4).max(12)
    })

function checkingReqBodyMiddleware(req, res, next){

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
}

module.exports = checkingReqBodyMiddleware