const Payment = require("../models/payment.model.js");

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const payment = new Payment({
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency,
    payment_method: req.body.payment_method,
    description: req.body.description
  });

  Payment.create(payment, (err, data) => {
    if (err) {
      if (err.message) {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Payment."
        });
      }
    } else {
      res.send(data);
    }
  });
};

exports.findOne = (req, res) => {
  Payment.findById(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Payment with id ${req.params.paymentId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Payment with id " + req.params.paymentId
        });
      }
    } else {
      res.send(data);
    }
  });
};

exports.process = (req, res) => {
  Payment.processPayment(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Payment with id ${req.params.paymentId}.`
        });
      } else if (err.message) {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({
          message: "Error processing Payment with id " + req.params.paymentId
        });
      }
    } else {
      res.send(data);
    }
  });
};
