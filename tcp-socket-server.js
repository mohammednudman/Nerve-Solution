require("dotenv").config();
const net = require("net");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const amqp = require("amqplib");

const port = process.env.PORT;
const rabbitMqHost = process.env.RABBITMQ_URL;

const secret = process.env.HASHING_SECRET;

const decryption = (data) => {
    const binData = CryptoJS.AES.decrypt(data.toString(), secret);
    const plainText = binData.toString(CryptoJS.enc.Utf8);
    return plainText;
};

const encryption = (message) => {
    return CryptoJS.AES.encrypt(message, secret).toString();
};

const object = {
    SetA: [{ "One": 1, "Two": 2 }],
    SetB: [{ "Three": 3, "Four": 4 }],
    SetC: [{ "Five": 5, "Six": 6 }],
    SetD: [{ "Seven": 7, "Eight": 8 }],
    SetE: [{ "Nine": 9, "Ten": 10 }]
};

const server = net.createServer((socket) => {
    console.log("Client connected");

    async function connectToRabbitMQ() {
        const connection = await amqp.connect(rabbitMqHost);
        const channel = await connection.createChannel();

        channel.assertQueue("request_queue");

        channel.consume("request_queue", (msg) => {
            const socketData = msg.content.toString();
            const decryptedData = decryption(socketData);
            const strData = decryptedData.toString();

            const command = strData.split("-");
            const MainKey = command[0];
            const SecondaryKey = command[1];

            let result;

            if (object[MainKey]) {
                const array = object[MainKey];
                if (array.length == 0) {
                    socket.write(encryption("EMPTY"));
                } else {
                    const obj = array[0];
                    result = obj[SecondaryKey];
                    if (result === undefined) {
                        socket.write(encryption("EMPTY"));
                    } else {
                        let counter = 0;
                        let i = setInterval(() => {
                            const t = moment().format("DD/MM/YYYY HH:mm:ss");
                            socket.write(encryption(t));
                            counter++;
                            if (counter >= result || result === undefined) {
                                clearInterval(i);
                            }
                        }, 1000);
                    }
                }
            } else {
                socket.write(encryption("EMPTY"));
            }

            channel.ack(msg);
        });
    }

    connectToRabbitMQ().catch((err) => {
        console.error("Failed to connect to RabbitMQ:", err);
    });

    socket.on("end", () => {
        console.log("Client disconnected");
    });

    socket.on("error", (error) => {
        console.log(`Socket Error: ${error.message}`);
    });
});

server.on("error", (error) => {
    console.log(`Server Error: ${error.message}`);
});

server.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
});
