const {Etcd3} = require('etcd3');

const client = new Etcd3({
    hosts: 'localhost:2379',
    auth: {
       username: 'root',
       password: 'asd.12345'
    }
});

// (async () => {
//     const services = await client.get('/services/a').string();
//     console.log('service A:', services);

//     const allServices = await client.getAll().prefix('/services').keys();
//     console.log('all services:', allServices);

//     const watcher = await client.watch().key('/services/a').create();

//     watcher.on('put', (req) => {
//         console.log('put', req.value.toString())
//       })
//       watcher.on('delete', (req) => {
//         console.log('delete')
//       })
// })()

// 保存配置
async function saveConfig(key, value) {
    await client.put(key).value(value);
}

// 读取配置
async function getConfig(key) {
    return await client.get(key).string();
}

// 删除配置
async function deleteConfig(key) {
    await client.delete().key(key);
}


// 服务注册
async function registerService(serviceName, instanceId, metadata) {
    const key = `/services/${serviceName}/${instanceId}`;
    const lease = client.lease(10); // 10秒租约
    await lease.put(key).value(JSON.stringify(metadata));
    lease.on('lost', async () => {  // 监听 lost 事件，在过期后自动续租
        console.log('租约过期，重新注册...');
        await registerService(serviceName, instanceId, metadata);
    });
}

// 服务发现
async function discoverService(serviceName) {
    const instances = await client.getAll().prefix(`/services/${serviceName}`).strings();
    console.log(instances,'instances');
    return Object.entries(instances).map(([key, value]) => JSON.parse(value));
}

// 监听服务变更
async function watchService(serviceName, callback) {
    const watcher = await client.watch().prefix(`/services/${serviceName}`).create();
    watcher.on('put', async event => {
        console.log('新的服务节点添加:', event.key.toString());
        callback(await discoverService(serviceName));
    }).on('delete', async event => {
        console.log('服务节点删除:', event.key.toString());
        callback(await discoverService(serviceName));
    });
}


(async function main() {
    const serviceName = 'my_service';
    
    await registerService(serviceName, 'instance_1', { host: 'localhost', port:3000 });
    await registerService(serviceName, 'instance_2', { host: 'localhost', port:3002 });

    const instances = await discoverService(serviceName);
    console.log('所有服务节点:', instances);

    watchService(serviceName, updatedInstances => {
        console.log('服务节点有变动:', updatedInstances);
    });
})();

