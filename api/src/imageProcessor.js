const path = require("path")
const { Worker, isMainThread } = require("worker_threads")
const pathToResizeWorker = path.resolve(__dirname, "resizeWorker.js")
const pathToMonochromeWorker = path.resolve(__dirname, "monochromeWorker.js")

const uploadPathResolver = (filename) => {
    return path.resolve(__dirname, "../uploads", filename)
}

const imageProcessor = (filename) => {
    return new Promise((resolve, reject) => {

        const sourcePath = uploadPathResolver(filename)
        const resizedDestination = uploadPathResolver("resized-" + filename)
        const monochromeDestination = uploadPathResolver("monochrome-" + filename)

        if (isMainThread) {
            console.log("In mian thread")
            try {
                const resizeWorker = new Worker(pathToResizeWorker, {
                    workerData: {
                        source: sourcePath,
                        destination: resizedDestination
                    }
                })
                var resizeWorkerFinished = false;
                var monochromeWorkerFinished = false;

                // resizeWroker thread events
                
                resizeWorker.on("message", (message) => {
                    resizeWorkerFinished = true
                    if (monochromeWorkerFinished == true) {
                        console.log("resolved resized")
                        resolve("resizeWorker finished processing")
                    }
                })
                resizeWorker.on("error", (error) => {
                    reject(new Error(error.message))
                }).on("exit", (code) => {
                    if(code !== 0){
                        reject(new Error("Exited with code "+code))
                    }
                })

                const monochromeWorker = new Worker(pathToMonochromeWorker, {
                    workerData: {
                        source: sourcePath,
                        destination: monochromeDestination
                    }
                })

                // MonochromeWorker thread events
                monochromeWorker.on("messsage", (message) => {
                    console.log(message)
                    monochromeWorkerFinished = true;
                    if (resizeWorkerFinished == true) {
                        console.log("resolved monochrome")
                        resolve("monochromeWorker finished processing")
                    }
                }).on("error", (error)=>{
                    
                    reject(new Error(error.message))

                }).on("exit", (code) => {
                    if(code !== 0){
                        reject(new Error(`Exited with the code ${code}`));
                    }
                })
            } catch (error) {
                console.log("error try catch, image")
                reject(error)
            }

        } else {
            reject(new Error("not on mian thread"))
        }

    })
}



module.exports = imageProcessor