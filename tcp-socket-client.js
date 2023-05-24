require("dotenv").config();
const net = require("net");
const CryptoJS = require("crypto-js");
const amqp = require("amqplib");

const host = "127.0.0.1";

const port = process.env.PORT
const secret = process.env.HASHING_SECRET
const rabbitMqHost = process.env.RABBITMQ_URL;

const message = "SetC-Six"


const encryption = (message) => {
    return CryptoJS.AES.encrypt(message, secret).toString();
}

const decryption = (data) => {
    const binData = CryptoJS.AES.decrypt(data.toString(), secret);
    const plainText = binData.toString(CryptoJS.enc.Utf8);
    return plainText;
}


const client = net.createConnection(port, host, () => {
    console.log("Connected");

    async function connectToRabbitMQ() {
        const connection = await amqp.connect(rabbitMqHost);
        const channel = await connection.createChannel();

        const encryptedMessage = encryption(message);

        channel.assertQueue("request_queue");
        channel.sendToQueue("request_queue", Buffer.from(encryptedMessage));
    }

    connectToRabbitMQ().catch((err) => {
        console.error("Error connecting to RabbitMQ", err);
    })
    // client.write(encryptedMessage);
});

client.on("data", (data) => {
    const decryptMessage = decryption(data);
    console.log(`Received: ${decryptMessage}`);
});

client.on("error", (error) => {
    console.log(`Error: ${error.message}`);
});

client.on("close", () => {
    console.log("Connection closed");
});