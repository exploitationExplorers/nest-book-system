class RequestQueue {
    constructor(maxConcurrent) {
        this.maxConcurrent = maxConcurrent;
        this.currentConcurrent = 0
        this.queue = []
    }
    add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                request,
                resolve,
                reject
            }) 
            this.processQueue()
        })
    }

    processQueue() {
       if(this.currentConcurrent < this.maxConcurrent && this.queue.length > 0) {
           const { request, resolve, reject } = this.queue.shift()
           this.currentConcurrent++
           request().then(resolve).catch(reject).finally(() => {
               this.currentConcurrent--
               this.processQueue()
           })
       } 
    }

}

// 示例
function fetchData(url) {
    return new fetch(url).then(res => res.json())
}

// 使用请求队列
const requestQueue = new RequestQueue(5)

const urls = [
    'https://xxxxx1',
    'https://xxxxx2',
]
const requests = urls.map(url => () => requestQueue.add(() => fetchData(url)))

Promise.all(requests.map(request => requestQueue.add(request)))
    .then(res => {
        console.log("🚀 ~ 所有请求完成:", res)
    })
    .catch(error => {
        console.error("🚀 ~ 请求失败:", error) 
    })
    
