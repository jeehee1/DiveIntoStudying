const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.groupSchema = Joi.object({
  group: Joi.object({
    title: Joi.string().required().escapeHTML(),
    subject: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
    times: Joi.string().required().escapeHTML(),
    online: Joi.string().escapeHTML().allow(null),
    description: Joi.string().required().escapeHTML(),
  }).required(),
});
