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
            try {
                const resizeWorker = Worker(pathToResizeWorker, {
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
                    if (monochromeWorkerFinished) {
                        resolve("resizeWorker finished processing")
                    }
                }).on("error", (error) => {
                    reject(new Error(error.message))
                })
                const monochromeWorker = Worker(pathToMonochromeWorker, {
                    workerData: {
                        source: sourcePath,
                        destination: monochromeDestination
                    }
                }).on("exit", (code) => {
                    if (code !== 0) {
                        reject(new Error(`Exited wit the status code: ${code}`));
                    }
                })

                // MonochromeWorker thread events
                monochromeWorker.on("messsage", (message) => {
                    monochromeWorkerFinished = true;
                    if (resizeWorkerFinished) {
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
                reject(error)
            }

        } else {
            reject(new Error("not on mian thread"))
        }

    })
}



module.exports = imageProcessor