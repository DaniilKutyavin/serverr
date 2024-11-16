const orderService = require("../service/order-service");
const basketService = require("../service/basket-service"); // To clear the basket after order
const ApiError = require("../error/ApiError");

class OrderController {
  // Controller method to create an order
  async createOrder(req, res, next) {
    try {
      const { phone, fio, city, email, comment, giftId, paymentMethod } = req.body;

      if (!req.user || !req.user.id) {
        throw ApiError.badRequest("User not authenticated");
      }

      const order = await orderService.createOrder(
        req.user.id,
        phone,
        fio,
        city,
        email,
        comment,
        giftId,
        paymentMethod
      );
      await basketService.clearBasket(req.user.id); // Clear basket after order creation
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  // Controller method to get all orders (for admin)
  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }

  // Controller method to get gift availability for a user
  async getGiftAvailability(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        throw ApiError.badRequest("User not authenticated");
      }
  
      const giftId = req.query.giftId; // Извлекаем giftIds из req.query
      if (!giftId || !Array.isArray(giftId)) {
        throw ApiError.badRequest("No gift IDs provided");
      }
  
      const availability = await orderService.getGiftAvailability(req.user.id, giftId.map(Number));
      res.status(200).json(availability);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }

  // Controller method to update order status
  async updateOrder(req, res, next) {
    const { id } = req.params; // Get the order ID from the request parameters
    const updateData = req.body; // Get the update data from the request body

    try {
      const updatedOrder = await orderService.updateOrder(id, updateData);
      return res.json(updatedOrder); // Return the updated order
    } catch (error) {
      next(error);
    }
  }

  // Controller method to get orders by user
  async getOrdersByUser(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        throw ApiError.badRequest("User not authenticated");
      }

      const orders = await orderService.getOrdersByUser(req.user.id);
      res.status(200).json(orders);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }

  // Controller method to get a specific order by ID
  async getOrderById(req, res, next) {
    try {
      const { orderId } = req.params; // Assuming orderId is passed in the URL params
      const order = await orderService.getOrderById(orderId);
      res.status(200).json(order);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }
}

module.exports = new OrderController();
