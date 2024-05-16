const mongoose = require("mongoose");

const connectDatabase = () => {
    var DBURL = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_BASENAME}_${process.env.ENVTYPE}`

    console.log("DBURL :" + DBURL);
    mongoose.connect(DBURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host}`);
    });
}

module.exports = connectDatabase