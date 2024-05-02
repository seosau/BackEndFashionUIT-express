const User = require("../models/user.model.js");
const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const { ObjectId } = require("mongodb");
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
      const statisticsProductPurchase = await this.statisticsProductPurchase(
        req,
        res,
        next
      );
      const statisticalGrowthProfit = await this.statisticalGrowthProfit(
        req,
        res,
        next
      );
      res.json({
        topDealUsers,
        statisticalGrowthAccounts,
        statisticalGrowthProducts,
        statisticalGrowthRevenue,
        statisticsProductPurchase,
        statisticalGrowthProfit,
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
      const previousWeekTotal = 100; // Example previous week total
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
      const previousWeekTotalRevenue = 50000; // Example previous week total revenue
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
        number:
          (totalRevenue*1000).toLocaleString("de-DE") + "đ",
        percentage: Math.round(percentageGrowth),
        chartData: chartData,
      };
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  async statisticsProductPurchase(req, res, next) {
    try {
      // Query the database to get orders with product details
      const orders = await Order.find().populate("products.product").exec();

      // Initialize counters for each category
      let maleCount = 0;
      let femaleCount = 0;
      let childCount = 0;

      // Initialize an array to store the counts for each day of the week
      const weeklyCounts = [
        { name: "Sun", male: 0, female: 0, child: 0 },
        { name: "Mon", male: 0, female: 0, child: 0 },
        { name: "Tue", male: 0, female: 0, child: 0 },
        { name: "Wed", male: 0, female: 0, child: 0 },
        { name: "Thu", male: 0, female: 0, child: 0 },
        { name: "Fri", male: 0, female: 0, child: 0 },
        { name: "Sat", male: 0, female: 0, child: 0 },
      ];

      // Loop through orders to count products purchased by gender and age group
      for (const order of orders) {
        const dayOfWeek = moment(order.createdAt).format("ddd");
        for (const product of order.products) {
          // Get the product object by awaiting Product.findById
          const currProduct = await Product.findById(product.productId).exec();
          // Check if product exists and has a category
          if (currProduct && currProduct.category) {
            // Increment the corresponding count based on the category
            const sex = currProduct.category.sex.toLowerCase();
            if (sex === "nam") {
              weeklyCounts.find((item) => item.name === dayOfWeek).male++;
              maleCount++;
            } else if (sex === "nữ") {
              weeklyCounts.find((item) => item.name === dayOfWeek).female++;
              femaleCount++;
            } else if (sex === "trẻ em") {
              weeklyCounts.find((item) => item.name === dayOfWeek).child++;
              childCount++;
            }
          }
        }
      }

      // Prepare data for male, female, and child categories
      const data = [
        { name: "male", value: maleCount, color: "#0088FE" },
        { name: "female", value: femaleCount, color: "#00C49F" },
        { name: "child", value: childCount, color: "#FFBB28" },
      ];

      // Return the result
      return {
        data: data,
        chartData: weeklyCounts,
      };
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async statisticalGrowthProfit(req, res, next) {
    try {
      // Query the database to get order creation dates and total prices
      const orders = await Order.find({}, "createdAt totalPrice").exec();

      // Initialize an object to store the revenue and profit for each day of the week
      const weeklyData = {
        Sun: { revenue: 0, profit: 0 },
        Mon: { revenue: 0, profit: 0 },
        Tue: { revenue: 0, profit: 0 },
        Wed: { revenue: 0, profit: 0 },
        Thu: { revenue: 0, profit: 0 },
        Fri: { revenue: 0, profit: 0 },
        Sat: { revenue: 0, profit: 0 },
      };

      // Loop through orders and sum up the total prices for each day of the week
      orders.forEach((order) => {
        const dayOfWeek = moment(order.createdAt).format("ddd");
        weeklyData[dayOfWeek].revenue += order.totalPrice;
      });

      // Calculate total revenue
      const totalRevenue = Object.values(weeklyData).reduce(
        (acc, val) => acc + val.revenue,
        0
      );

      // Calculate profit (assuming profit percentage is 5%)
      const profitPercentage = 5;
      Object.keys(weeklyData).forEach((dayOfWeek) => {
        weeklyData[dayOfWeek].profit =
          (weeklyData[dayOfWeek].revenue * profitPercentage) / 100;
      });

      // Calculate the percentage growth compared to the previous week
      // For simplicity, let's assume we have data for 2 weeks
      const previousWeekTotalRevenue = 20000; // Example previous week total revenue
      const percentageGrowth =
        ((totalRevenue - previousWeekTotalRevenue) / previousWeekTotalRevenue) *
        100;

      // Prepare chart data
      const chartData = Object.keys(weeklyData).map((dayOfWeek) => ({
        name: dayOfWeek,
        profit: weeklyData[dayOfWeek].profit,
      }));

      // Return the result
      return {
        chartData: chartData,
      };
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
}

module.exports = new DashboardController();
