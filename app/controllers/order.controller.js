/**
 * Order Controller
 * Handles HTTP requests for order processing functionality
 * 
 * This controller provides REST API endpoints for the OrderProcessor service
 * while maintaining full backward compatibility with the existing customer system.
 */

const OrderProcessor = require("../services/orderProcessor");

// Create a singleton instance for the application
const orderProcessor = new OrderProcessor();

// Process an order
exports.processOrder = async (req, res) => {
  try {
    const { items = [], options = {} } = req.body;
    
    const result = await orderProcessor.processOrder(items, options);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get processing history
exports.getHistory = (req, res) => {
  try {
    const history = orderProcessor.getProcessingHistory();
    res.status(200).json({
      success: true,
      history: history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Clear processing history
exports.clearHistory = (req, res) => {
  try {
    orderProcessor.clearHistory();
    res.status(200).json({
      success: true,
      message: "Processing history cleared successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Validate order items
exports.validateItems = (req, res) => {
  try {
    const { items } = req.body;
    const validation = orderProcessor.validateItems(items);
    
    res.status(200).json({
      success: true,
      validation: validation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Process multiple orders in batch
exports.processBatch = async (req, res) => {
  try {
    const { orderBatch, options = {} } = req.body;
    
    const results = await orderProcessor.processBatch(orderBatch, options);
    res.status(200).json({
      success: true,
      results: results,
      processedCount: results.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get processing statistics
exports.getStatistics = (req, res) => {
  try {
    const stats = orderProcessor.getStatistics();
    res.status(200).json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};