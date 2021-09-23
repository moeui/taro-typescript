export default function sleep(seconds: number): Promise<boolean> {
    const now = +new Date()
    let t: ReturnType<typeof setInterval>
    return new Promise((resolve, reject) => {
        t = setInterval(() => {
            if (now + seconds * 1000 < +new Date()) {
                clearInterval(t)
                resolve(true)
            }
        }, 10)
    })
}
