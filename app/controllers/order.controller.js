const Order = require("../models/order.model.js");
const Joi = require("joi");

// Validation schema for order creation
const orderSchema = Joi.object({
  customer_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Customer ID must be a number',
      'number.integer': 'Customer ID must be an integer',
      'number.positive': 'Customer ID must be positive',
      'any.required': 'Customer ID is required'
    }),
  total_amount: Joi.number().positive().precision(2).required()
    .messages({
      'number.base': 'Total amount must be a number',
      'number.positive': 'Total amount must be positive',
      'any.required': 'Total amount is required'
    }),
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').default('pending')
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: pending, processing, shipped, delivered, cancelled'
    }),
  order_date: Joi.date().iso().default(() => new Date())
    .messages({
      'date.base': 'Order date must be a valid date',
      'date.format': 'Order date must be in ISO format'
    }),
  items: Joi.array().items(
    Joi.object({
      product_name: Joi.string().min(1).max(255).required()
        .messages({
          'string.base': 'Product name must be a string',
          'string.empty': 'Product name cannot be empty',
          'string.min': 'Product name must be at least 1 character long',
          'string.max': 'Product name cannot exceed 255 characters',
          'any.required': 'Product name is required'
        }),
      quantity: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Quantity must be a number',
          'number.integer': 'Quantity must be an integer',
          'number.positive': 'Quantity must be positive',
          'any.required': 'Quantity is required'
        }),
      price: Joi.number().positive().precision(2).required()
        .messages({
          'number.base': 'Price must be a number',
          'number.positive': 'Price must be positive',
          'any.required': 'Price is required'
        })
    })
  ).min(1).optional()
    .messages({
      'array.base': 'Items must be an array',
      'array.min': 'At least one item is required if items are provided'
    })
});

// Create and Save a new Order
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Validate request body against schema
  const { error, value } = orderSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).send({
      message: "Validation failed",
      errors: errorMessages
    });
  }

  // Create an Order
  const order = new Order(value);

  // Save Order in the database
  Order.create(order, (err, data) => {
    if (err) {
      console.error("Error creating order:", err);
      
      // Handle specific database errors
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).send({
          message: "Invalid customer_id. Customer does not exist."
        });
      }
      
      return res.status(500).send({
        message: err.message || "Some error occurred while creating the Order."
      });
    }
    
    res.status(201).send({
      message: "Order created successfully",
      data: data
    });
  });
};