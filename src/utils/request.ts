import { request, RequestTask } from "@tarojs/taro";

export default async (options): Promise<RequestTask<any>> => {
    const { url, data, method = "GET" } = options;
    const header = {};
    if (method === "POST") {
        header["content-type"] = "application/json";
    }
    return request({
        url,
        method,
        data,
        header,
    })
        .then(async (res) => {
            const { statusCode, data: d } = res;
            if (statusCode !== 200) {
                return Promise.reject(d);
            }
            return d;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};
