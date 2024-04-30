const User = require("../models/user.model.js");
const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const moment = require("moment");
class DashboardController {
  async index(req, res, next) {
    try {
      const topDealUsers = await this.getTopUsers(req, res, next);
      const statisticalGrowthAccounts = await this.statisticalGrowthAccounts(
        req,
        res,
        next
      );
      const statisticalGrowthProducts = await this.statisticalGrowthProducts(
        req,
        res,
        next
      );
      const statisticalGrowthRevenue = await this.statisticalGrowthRevenue(
        req,
        res,
        next
      );
      res.json({
        topDealUsers,
        statisticalGrowthAccounts,
        statisticalGrowthProducts,
        statisticalGrowthRevenue,
      });
    } catch (error) {
      console.error("Lỗi khi thực hiện thống kê:", error);
      res.status(500).json({ error: "Lỗi khi thực hiện thống kê" });
    }
  }

  async getTopUsers(req, res, next) {
    try {
      // Tìm tất cả các đơn hàng
      const allOrders = await Order.find().populate("userId").exec();

      // Tạo một đối tượng để lưu trữ thông tin thống kê
      const userStats = {};

      // Lặp qua từng đơn hàng
      allOrders.forEach((order) => {
        if (order.userId) {
          const userId = order.userId._id;
          const totalAmount = order.totalPrice;

          // Nếu userStats đã có thông tin về người dùng này, cập nhật tổng số tiền đã chi
          if (userStats[userId]) {
            userStats[userId].totalAmount += totalAmount;
          }
          // Nếu chưa có, tạo một bản ghi mới cho người dùng này
          else {
            userStats[userId] = {
              name: order.userId.name,
              email: order.userId.email,
              avatar: order.userId.avatar,
              totalAmount: totalAmount,
            };
          }
        }
      });

      // Chuyển đổi userStats thành mảng để dễ dàng sử dụng trong frontend
      const userStatsArray = Object.values(userStats)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 8);

      // Trả về kết quả thống kê
      return userStatsArray;
    } catch (error) {
      console.log(error);
    }
  }
  async statisticalGrowthAccounts(req, res, next) {
    try {
      // Query the database to get user registration dates
      const userRegistrationDates = await User.find({}, "createdAt").exec();

      // Initialize an object to store the count of users registered each day of the week
      const weeklyCounts = {
        Sun: 0,
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
      };

      // Loop through user registration dates and count registrations for each day of the week
      userRegistrationDates.forEach((user) => {
        if (!user.isAdmin) {
          const dayOfWeek = moment(user.createdAt).format("ddd");
          weeklyCounts[dayOfWeek]++;
        }
      });

      // Calculate total number of registered users
      const totalUsers = Object.values(weeklyCounts).reduce(
        (acc, val) => acc + val,
        0
      );

      // Calculate the percentage growth compared to the previous week
      // For simplicity, let's assume we have data for 2 weeks
      const previousWeekTotal = 50; // Example previous week total
      const percentageGrowth =
        ((totalUsers - previousWeekTotal) / previousWeekTotal) * 100;

      // Prepare chart data
      const chartData = Object.keys(weeklyCounts).map((dayOfWeek) => ({
        name: dayOfWeek,
        users: weeklyCounts[dayOfWeek],
      }));

      // Return the result
      return {
        number: totalUsers.toLocaleString(),
        percentage: Math.round(percentageGrowth),
        chartData: chartData,
      };
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  async statisticalGrowthProducts(req, res, next) {
    try {
      // Query the database to get user registration dates
      const products = await Product.find({}, "createdAt").exec();

      // Initialize an object to store the count of users registered each day of the week
      const weeklyCounts = {
        Sun: 0,
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
      };

      // Loop through user registration dates and count registrations for each day of the week
      products.forEach((product) => {
        const dayOfWeek = moment(product.createdAt).format("ddd");
        weeklyCounts[dayOfWeek]++;
      });

      // Calculate total number of registered users
      const totalProducts = Object.values(weeklyCounts).reduce(
        (acc, val) => acc + val,
        0
      );

      // Calculate the percentage growth compared to the previous week
      // For simplicity, let's assume we have data for 2 weeks
      const previousWeekTotal = 20; // Example previous week total
      const percentageGrowth =
        ((totalProducts - previousWeekTotal) / previousWeekTotal) * 100;

      // Prepare chart data
      const chartData = Object.keys(weeklyCounts).map((dayOfWeek) => ({
        name: dayOfWeek,
        products: weeklyCounts[dayOfWeek],
      }));

      // Return the result
      return {
        number: totalProducts.toLocaleString(),
        percentage: Math.round(percentageGrowth),
        chartData: chartData,
      };
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  async statisticalGrowthRevenue(req, res, next) {
    try {
      // Query the database to get order creation dates and total prices
      const orders = await Order.find({}, "createdAt totalPrice").exec();

      // Initialize an object to store the revenue for each day of the week
      const weeklyRevenue = {
        Sun: 0,
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
      };

      // Loop through orders and sum up the total prices for each day of the week
      orders.forEach((order) => {
        const dayOfWeek = moment(order.createdAt).format("ddd");
        weeklyRevenue[dayOfWeek] += order.totalPrice;
      });

      // Calculate total revenue
      const totalRevenue = Object.values(weeklyRevenue).reduce(
        (acc, val) => acc + val,
        0
      );

      // Calculate the percentage growth compared to the previous week
      // For simplicity, let's assume we have data for 2 weeks
      const previousWeekTotalRevenue = 20000; // Example previous week total revenue
      const percentageGrowth =
        ((totalRevenue - previousWeekTotalRevenue) / previousWeekTotalRevenue) *
        100;

      // Prepare chart data
      const chartData = Object.keys(weeklyRevenue).map((dayOfWeek) => ({
        name: dayOfWeek,
        revenue: weeklyRevenue[dayOfWeek],
      }));

      // Return the result
      return {
        number: totalRevenue.toLocaleString() + ',000đ',
        percentage: Math.round(percentageGrowth),
        chartData: chartData,
      };
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
}

module.exports = new DashboardController();
