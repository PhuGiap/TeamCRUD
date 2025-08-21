const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("phu_giap", "phu_giap_user", "JLAFxyckqyPpIq7oAX6KmiIClRdOjCVu", {
  host: "dpg-d242l815pdvs73fre220-a.oregon-postgres.render.com",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
  logging: false,
});

module.exports = sequelize;
