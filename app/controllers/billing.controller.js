const Billing = require("../models/billing.model.js");
const logger = require("../config/logger.config.js");

// Create and Save a new Billing record
exports.create = (req, res) => {
  logger.trace('Entering billing controller create', { body: req.body });
  
  // Validate request
  if (!req.body) {
    logger.warn('Empty request body for billing creation');
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  if (!req.body.customer_id || !req.body.amount) {
    logger.warn('Missing required fields for billing creation', { body: req.body });
    res.status(400).send({
      message: "Customer ID and amount are required!"
    });
    return;
  }

  // Create a Billing record
  const billing = new Billing({
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    description: req.body.description,
    status: req.body.status
  });

  logger.debug('Creating new billing record', { billing });

  // Save Billing in the database
  Billing.create(billing, (err, data) => {
    if (err) {
      logger.error('Error in billing controller create', { error: err.message });
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Billing record."
      });
    } else {
      logger.info('Successfully created billing record via controller', { billingId: data.id });
      res.send(data);
    }
  });
};

// Retrieve all Billing records from the database
exports.findAll = (req, res) => {
  logger.trace('Entering billing controller findAll');
  
  Billing.getAll((err, data) => {
    if (err) {
      logger.error('Error in billing controller findAll', { error: err.message });
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving billing records."
      });
    } else {
      logger.info('Successfully retrieved all billing records via controller', { count: data.length });
      res.send(data);
    }
  });
};

// Find a single Billing record by ID
exports.findOne = (req, res) => {
  const billingId = req.params.billingId;
  logger.trace('Entering billing controller findOne', { billingId });
  
  Billing.findById(billingId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn('Billing record not found via controller', { billingId });
        res.status(404).send({
          message: `Not found Billing record with id ${billingId}.`
        });
      } else {
        logger.error('Error in billing controller findOne', { error: err.message, billingId });
        res.status(500).send({
          message: "Error retrieving Billing record with id " + billingId
        });
      }
    } else {
      logger.info('Successfully found billing record via controller', { billingId });
      res.send(data);
    }
  });
};