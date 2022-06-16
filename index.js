const express = require('express')
const path = require('path')
var cors = require("cors");
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const crypt = require("crypto")
const Razorpay = require("razorpay");
// Test Keys
const razorpay_id = "rzp_test_tkuXJqWouMB6sR"
const razorpay_secret = "DPGHitPmJxxpMGwAoZpDRU4l"

const PORT = process.env.PORT || 5000
express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(cors({ origin: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get("/", (req, res) => {
    res.send("Smark API V1.1");
  })
  .post("/payment/init", jsonParser, async (req, res) => {
    const data = req.body
    const instance = new Razorpay({
      key_id: razorpay_id, // YOUR RAZORPAY KEY
      key_secret: razorpay_secret, // YOUR RAZORPAY SECRET
    });
    const options = {
      amount: data.amount,
      currency: 'INR',
      receipt: data.receiptId,
      payment_capture: 1
    };
    instance.orders.create(options).then((order) => {
      if (!order) return res.status(500).send('Some error occured');
      res.json(order);
    }).catch((error) => {
      console.log(error)
      res.status(500).send(error);
    });
  })
  .post("/payment/success", jsonParser, (req, res) => {
    const order = req.body;
    console.log(order)
    const text = order.razorpayOrderId + "|" + order.razorpayPaymentId;
    try {
      var signature = crypt
        .createHmac("SHA256", razorpay_secret)
        .update(text)
        .digest("hex");
      console.log(signature, order.razorpaySignature);
      if (signature === order.razorpaySignature) {
        console.log("PAYMENT SUCCESSFULL");
        res.send("PAYMENT_SUCCESSFULL");
      } else {
        res.status(500).send(error);
      }
    } catch (error) {
      console.log(error)
      res.status(500).send(error);
      res.end();
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
