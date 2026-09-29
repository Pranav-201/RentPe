import Joi from "joi";

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message
      }));

      return res.badRequest({
        error: "Validation failed",
        details: messages
      });
    }

    req.body = value;
    return next();
  };
}

export const validationSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().required(),
    collegeId: Joi.string().min(2).max(50).required(),
    collegeName: Joi.string().min(2).max(100).required(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  product: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(5).max(5000).required(),
    price: Joi.number().min(0).optional(),
    pricePerDay: Joi.number().min(0).optional(),
    securityDeposit: Joi.number().min(0).optional(),
    condition: Joi.string().valid("New", "Like New", "Good", "Fair").optional(),
    location: Joi.string().optional(),
    discountPrice: Joi.number().min(0).optional(),
    category: Joi.string().required(),
    sku: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().required(),
          alt: Joi.string().optional()
        })
      )
      .optional()
  }),

  category: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(1000).optional(),
    image: Joi.object({
      url: Joi.string().optional(),
      alt: Joi.string().optional()
    }).optional()
  }),

  rentalRequest: Joi.object({
    item: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    message: Joi.string().max(1000).allow("").optional()
  }),

  cartItem: Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().min(1).required()
  }),

  updateCartItem: Joi.object({
    quantity: Joi.number().min(1).required(),
    product: Joi.string().optional()
  }),

  order: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    paymentMethod: Joi.string().required()
  }),

  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    title: Joi.string().min(1).max(200).required(),
    comment: Joi.string().min(5).max(2000).required()
  })
};