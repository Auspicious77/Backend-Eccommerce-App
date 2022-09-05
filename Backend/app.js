const express = require('express');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

//Routers
const productsRoute = require('./routers/products');
const categoriesRoute = require('./routers/categories');
const ordersRoute = require('./routers/orders');
const usersRoute = require('./routers/users');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');




require('dotenv/config');
const api = process.env.API_URL

app.use(cors());
//options http request, *allows http to pass through diff origin
app.options('*', cors())


//middleware libraries
//middleware that helps read json comming from the data
//previously it is app.use(bodyParser)
app.use(express.json());
//used to log http request coming from the server
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
//make public folder static
app.use('/public/uploads', express.static(__dirname + '/public/uploads' ))

app.use(`${api}/products`, productsRoute)
app.use(`${api}/categories`, categoriesRoute)
app.use(`${api}/orders`, ordersRoute)
app.use(`${api}/users`, usersRoute)


//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    //options
    useUnifiedTopology: true, 
    dbName: 'Ecommerce'
})
.then(()=>{
    console.log('DataBase connection is ready...')
})
.catch((err)=>{
    console.log(err)
})

//server
//Development
// app.listen(PORT, () => {
//     console.log('server running on', PORT)

// })

//Production
var server = app.listen(process.env.PORT || PORT, function () {
    var port = server.address().port;
    console.log('Express is working on Port' + port)
}) 