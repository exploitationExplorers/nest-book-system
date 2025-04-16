import * as amqp from 'amqplib'

const connect = await amqp.connect('amqp://localhost:5672')

const channel = await connect.createChannel()

await channel.assertQueue('producer',{durable: true}) 

// await channel.sendToQueue('producer', Buffer.from('Hello World!'), {

// })
/**生产者每 0.5s 发送一次消息。 */
let i = 1;
setInterval(async () => {
    const msg = 'hello' + i;
    console.log('发送消息：', msg);
    await channel.sendToQueue('producer',Buffer.from(msg))
    i++;
}, 500);