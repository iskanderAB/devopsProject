require("dotenv").config();
const { sequelize } = require("./models");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection to MySQL database has been established successfully.");
    
    // Test basic database info
    const [results] = await sequelize.query("SELECT VERSION() as version");
    console.log(`📊 MySQL Version: ${results[0].version}`);
    
    // Show current database
    const [dbResults] = await sequelize.query("SELECT DATABASE() as current_db");
    console.log(`🗄️  Current Database: ${dbResults[0].current_db}`);
    
    await sequelize.close();
    console.log("🔌 Connection closed successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }
}

testConnection();