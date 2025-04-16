import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);

const channel = await connect.createChannel();

const {queue} = await channel.assertQueue('producer')

channel.prefetch(3); // channel.prefetch(x) 限制消费者每次从队列中获取的消息数量为 x。

const currentTask = [];

channel.consume(queue, (msg) => {
    currentTask.push(msg);
    console.log('收到消息：', msg.content.toString());
}, {noAck: false}); // noAck: false 表示消费者需要手动确认消息。


setInterval(() => {
    const curMsg = currentTask.pop();
    channel.ack(curMsg); // channel.ack(msg) 表示消费者确认消息。
}, 1000);