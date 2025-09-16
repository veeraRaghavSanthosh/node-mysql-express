class OrderProcessor {
  constructor() {
    this.processingFee = 0.02; // 2% processing fee
  }

  async processOrder(items = []) {
    try {
      // Validate items
      const validationResult = this.validateItems(items);
      if (!validationResult.isValid) {
        return {
          processed: false,
          itemCount: items.length,
          errors: validationResult.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
      const processingFeeAmount = subtotal * this.processingFee;
      const totalAmount = subtotal + processingFeeAmount;

      // Simulate async processing (this could be database operations, API calls, etc.)
      await this.simulateAsyncProcessing();

      return {
        processed: true,
        itemCount: items.length,
        subtotal: Math.round(subtotal * 100) / 100,
        processingFee: Math.round(processingFeeAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        processed: false,
        itemCount: items.length,
        errors: [error.message],
        timestamp: new Date().toISOString()
      };
    }
  }

  validateItems(items) {
    const errors = [];
    
    if (!Array.isArray(items)) {
      errors.push('Items must be an array');
      return { isValid: false, errors };
    }

    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Invalid item at index ${index}: must be an object`);
        return;
      }

      if (!item.name || item.name.trim() === '') {
        errors.push(`Invalid item at index ${index}: name is required`);
      }

      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Invalid item at index ${index}: price must be a positive number`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async simulateAsyncProcessing() {
    // Simulate database operations or external API calls
    return new Promise((resolve) => {
      // Fixed delay to make tests deterministic
      setTimeout(resolve, 10);
    });
  }
}

module.exports = OrderProcessor;