import "./index.stylus";

import { Button, Image, Input, Text, View } from "@tarojs/components";
import {
    getBLEDeviceCharacteristics,
    getBLEDeviceServices,
    hideLoading,
    notifyBLECharacteristicValueChange,
    onBLECharacteristicValueChange,
    onBLEConnectionStateChange,
    showLoading,
    showModal,
    useRouter,
    writeBLECharacteristicValue,
} from "@tarojs/taro";
import { useEffect, useState } from "react";

import constant from "../../utils/constant";
import request from '../../utils/request';
import sleep from '../../utils/sleep';
import LoadingGif from "../home/img/loading.gif";
import NetworkIcon from './img/networkIcon.png';
import PasswordIcon from './img/passwordIcon.png';
import Success from './img/success.png';

export default (): React.ReactElement => {
    const { params } = useRouter()
    const [network, setNetwork] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const [services, setServices] = useState<getBLEDeviceServices.SuccessCallbackResult>()
    const [characteristics, setCharacteristics] = useState<getBLEDeviceCharacteristics.BLECharacteristic[]>([])
    const [show, setShow] = useState<boolean>(false)

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            if (params.deviceId) {
                const res = await getBLEDeviceServices({ deviceId: params.deviceId })
                setServices(res)
            }
        }
        fetch()
        return () => {
            setServices(undefined)
        };
    }, [params.deviceId]);

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            if (params.deviceId && services?.services) {
                const res = await getBLEDeviceCharacteristics({ deviceId: params.deviceId, serviceId: services.services[0].uuid })
                setCharacteristics(res.characteristics)
            }
        }
        fetch()
        return () => {
            setCharacteristics([])
        };
    }, [services, params.deviceId]);


    const _writeBLECharacteristicValue = async (buffer): Promise<void> => {
        if (!params.deviceId || !services?.services || !characteristics) return
        await writeBLECharacteristicValue({
            deviceId: params.deviceId,
            serviceId: services.services[0].uuid,
            characteristicId: characteristics[0].uuid,
            value: buffer
        })
    }

    const stringToUint8Array = (str: string): Uint8Array => {
        const arr: Array<number> = [];
        for (let i = 0, j = str.length; i < j; ++i) {
            arr.push(str.charCodeAt(i))
        }
        const tmpUint8Array = new Uint8Array(arr)
        return tmpUint8Array
    }

    const Send = async (): Promise<void> => {
        if (!network) {
            showModal({
                title: '提示',
                content: '请填写网络名称'
            })
            return
        }
        if (!password) {
            showModal({
                title: '提示',
                content: '请填写密码'
            })
            return
        }
        if (!params.deviceId) return
        try {
            showLoading({ title: '正在连接...' })
            setLoading(true)
            await _writeBLECharacteristicValue(stringToUint8Array(`${params.sn}|||${params.mobile}|||${network}|||${password}`).buffer)
            await sleep(15)
            let index = 0
            const timer = setInterval(async () => {
                const res = await requestApi({ "SNCode": params.sn, "Option": "query" })
                if (Number(res) && index < 15) {
                    clearInterval(timer)
                    setShow(true)
                    setLoading(false)
                    hideLoading()
                } else {
                    index++
                    clearInterval(timer)
                    setLoading(false)
                    showLoading({ title: '连接失败，请重试！' })
                    await sleep(3)
                    hideLoading()
                }
            }, 1000)
        } catch (error) {
            console.error(error)
            showModal({
                title: '提示',
                content: constant[error.errCode]
            })
            setLoading(false)
            hideLoading()
        }
    }

    const requestApi = async (data): Promise<Taro.request.SuccessCallbackResult<any>> => {
        const res = await request({
            url: 'https://domain.com',
            method: 'POST',
            data
        })
        return res
    }


    return (
        <View className='device'>
            {
                !show ? (
                    <View className='box'>
                        <View className='header'>
                            <View className='title'>
                                网络连接
                            </View>
                            <View className='info'>
                                请注意名称和密码需要区分大小写！<Text className='strong'>区分大小写！</Text>
                            </View>
                        </View>
                        <View className='form'>
                            <View className='item'>
                                <Image className='icon' src={NetworkIcon} />
                                <Input className='text' type='text' placeholder='请输入网络名称' focus value={network} onInput={(e) => setNetwork(e.detail.value)} />
                            </View>
                            <View className='item'>
                                <Image className='icon' src={PasswordIcon} />
                                <Input className='text' type='text' placeholder='请输入密码' value={password} onInput={(e) => setPassword(e.detail.value)} />
                            </View>
                        </View>
                        <View className='btnWrap'>
                            <Button className='btn' onClick={() => Send()}>
                                {loading && <Image className='icon' src={LoadingGif} />}
                                <View>{loading ? "连接中..." : "连接"}</View>
                            </Button>
                        </View>
                    </View>
                ) : (
                    <View className='box'>
                        <View className='success'>
                            <Image className='img' src={Success} />
                            <View className='text'>网络连接成功！</View>
                        </View>
                    </View>
                )
            }
        </View>
    );
}
