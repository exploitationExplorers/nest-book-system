import * as amap from 'amqplib'

const connect = await amap.connect('amqp://localhost:5672')

const channel = await connect.createChannel()

await channel.assertExchange('direct-test-exchange', 'direct'); // 创建一个 direct 类型的交换机。

channel.publish('direct-test-exchange', 'test1',  Buffer.from('hello1'));
channel.publish('direct-test-exchange', 'test2',  Buffer.from('hello2'));
channel.publish('direct-test-exchange', 'test3',  Buffer.from('hello3'));