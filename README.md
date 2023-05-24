# Nerve-Solution
## Problem Statement : 
- To implement the TCP Client Server using Socket Programming
- Ensure Encryption and Decryption of the messages transferred between client and server
- Ensure server should be able to handle multiple client connections without breaking any current connection
                       
## Solution : 
- Developed the TCP Server and Client using `net` library in javascript.
- Encrypted and Decrypted message using AES256 algorithm using `crypto-js` library in javascript.
- Used RabbitMQ queuing system to make it scalable and handle multiple request at the same time.
