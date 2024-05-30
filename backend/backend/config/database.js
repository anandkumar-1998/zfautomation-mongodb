const mongoose = require("mongoose");
let clientConnection; // we can access client in other mongoose / controller files
const connectDatabase = () => {
  var DBURL = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_BASENAME}_${process.env.ENVTYPE}?replicaSet=rs0&directConnection=true&retryWrites=true&appName=app1`;

  console.log("DBURL :" + DBURL);
  return mongoose
    .connect(DBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: "majority",
    })
    .then((data) => {
      clientConnection = data.connection.getClient();
      console.log(`Mongodb connected with server: ${data.connection.host}`);
      return data;
    });
};

const getClient = () => {
  if (clientConnection == undefined) {
    connectDatabase();
  }
  return clientConnection;
};
module.exports = { connectDatabase, getClient };
