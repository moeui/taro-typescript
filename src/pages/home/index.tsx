import "./index.stylus";

import { Button, Icon, Image, ScrollView, Text, View } from "@tarojs/components";
import {
    closeBluetoothAdapter,
    createBLEConnection,
    getBluetoothAdapterState,
    getSystemInfo,
    hideLoading,
    login,
    navigateTo,
    onBluetoothAdapterStateChange,
    onBluetoothDeviceFound,
    openBluetoothAdapter,
    showLoading,
    showModal,
    showToast,
    startBluetoothDevicesDiscovery,
    stopBluetoothDevicesDiscovery,
    useRouter
} from "@tarojs/taro";
import { useEffect, useState } from "react";

import request from '../../utils/request';
import { buf2hex, getShortenAddress } from "../../utils/utils";
import ArrowPNG from "./img/arrow.png";
import bleIcon from './img/bleIcon.png';
import BlockPNG from "./img/block.png";
import ButtonPNG from "./img/button.png";
import HeaderIcon from "./img/headerIcon.png";
import HomeImg from "./img/homeImg.png";
import LoadingGif from "./img/loading.gif";

let listHeight = 0

getSystemInfo({
    success: res => {
        listHeight = (res.windowHeight - 394) * (750 / res.windowWidth)
    }
})

export default (): React.ReactElement => {
    const { params } = useRouter()
    const [step1, setStep1] = useState(true);
    const [step2, setStep2] = useState(false);
    const [step3, setStep3] = useState(false);
    const [mobile, setMobile] = useState<string>('');
    const [searching, setSearching] = useState(false);
    const [sessionKey, setSessionKey] = useState<string>('')
    const [devicesList, setDevicesList] = useState<onBluetoothDeviceFound.CallbackResultBlueToothDevice[]>([]);

    const Search = (): void => {
        if (searching) {
            stopBluetoothDevicesDiscovery({
                success: (res) => {
                    console.log(res)
                    setSearching(false)
                }
            })
        } else {
            closeBluetoothAdapter({
                complete: (res) => {
                    openBluetoothAdapter({
                        success: (resAdapter) => {
                            console.log(resAdapter)
                            getBluetoothAdapterState({
                                success: (resState) => {
                                    console.log(resState)
                                }
                            })
                            startBluetoothDevicesDiscovery({
                                allowDuplicatesKey: false,
                                success: (resDiscovery) => {
                                    console.log(resDiscovery)
                                    setSearching(true)
                                    setDevicesList([])
                                }
                            })
                        },
                        fail: (err) => {
                            console.log(err)
                            showModal({
                                title: '??????',
                                content: '?????????????????????????????????',
                                showCancel: false,
                                success: () => {
                                    setSearching(false)
                                }
                            })
                        }
                    })
                }
            })
        }
    }

    const Connect = (item: onBluetoothDeviceFound.CallbackResultBlueToothDevice): void => {
        stopBluetoothDevicesDiscovery({
            success: () => {
                setSearching(false)
            }
        })
        showLoading({ title: '??????????????????...' })
        createBLEConnection({
            deviceId: item.deviceId,
            success: function (res) {
                hideLoading()
                showToast({
                    title: '????????????',
                    icon: 'success',
                    duration: 1000
                })
                navigateTo({
                    url: '../device/index?deviceId=' + item.deviceId + '&sn=' + params.sn + '&mobile=' + mobile
                })
            },
            fail: function (res) {
                console.log(res)
                hideLoading()
                showModal({
                    title: '??????',
                    content: '????????????',
                    showCancel: false
                })
            }
        })
    }

    const onLogin = async (): Promise<void> => {
        showLoading({ title: '????????????...' })
        const loginRes = await login()
        const res = await request({
            url: 'https://domain.com/chiaLogin',
            method: 'POST',
            data: {
                code: loginRes.code
            }
        })
        setStep1(false)
        setStep2(true)
        setSessionKey(res.data.sessionkey)
        hideLoading()
    }

    const getPhoneNumber = async (phoneRes):Promise<void> => {
        const decryptRes = await request({
            url: 'https://domain.com/chiaDecrypt',
            method: 'POST',
            data: {
                encryptDataB64: phoneRes.detail.encryptedData,
                ivB64: phoneRes.detail.iv,
                sessionKeyB64: sessionKey
            }
        })
        setStep2(false)
        setStep3(true)
        Search()
        setMobile(decryptRes.data)
    }


    onBluetoothAdapterStateChange((res) => {
        console.log(res);
        if (res) {
            setSearching(res.discovering);
            if (!res.available) {
                setSearching(false);
            }
        } else {
            setSearching(false);
        }
    });

    onBluetoothDeviceFound((devices: any) => {
        console.log("onBluetoothDeviceFound");
        //???????????????????????????????????????API??????????????????
        let isnotexist = true;
        const tmp: Array<onBluetoothDeviceFound.CallbackResultBlueToothDevice> = []
        if (devices.deviceId) {
            if (devices.advertisData) {
                devices.advertisData = buf2hex(devices.advertisData);
            } else {
                devices.advertisData = "";
            }

            for (let i = 0; i < devicesList.length; i++) {
                if (devices.deviceId == devicesList[i].deviceId) {
                    isnotexist = false;
                }
            }
            if (isnotexist) {
                tmp.push(devices);
            }
        } else if (devices.devices) {
            if (devices.devices[0].advertisData) {
                devices.devices[0].advertisData = buf2hex(
                    devices.devices[0].advertisData
                );
            } else {
                devices.devices[0].advertisData = "";
            }
            console.log(devices.devices[0]);
            for (let i = 0; i < devicesList.length; i++) {
                if (devices.devices[0].deviceId == devicesList[i].deviceId) {
                    isnotexist = false;
                }
            }
            if (isnotexist) {
                tmp.push(devices.devices[0]);
            }
        } else if (devices[0]) {
            if (devices[0].advertisData) {
                devices[0].advertisData = buf2hex(devices[0].advertisData);
            } else {
                devices[0].advertisData = "";
            }
            console.log(devices[0]);
            for (let i = 0; i < devicesList.length; i++) {
                if (devices[0].deviceId == devicesList[i].deviceId) {
                    isnotexist = false;
                }
            }
            if (isnotexist) {
                tmp.push(devices[0]);
            }
        }

        setDevicesList(tmp.concat(devicesList));
    });

    return (
        <View className='home'>
            {
                step1 ? (
                    <View className='initBox'>
                        <View className='header'>
                            <View className='title'>
                                ??????????????????
                            </View>
                            <View className='info'>
                                ????????????????????????????????? , ??????????????????
                            </View>
                            <View className='info'>
                                ?????????<Text className='yellow'>S/N</Text>???: <Text className='number'>{params.sn}</Text>
                            </View>
                        </View>
                        <View className='imgWrap'>
                            <Image src={HomeImg} className='img' />
                        </View>
                        <View className='footer'>
                            ?????????????????????????????? , ???????????????????????????
                        </View>
                        <Button className='btn' onClick={() => onLogin()}>
                            ?????????
                        </Button>
                    </View>
                ) : null
            }
            {
                step2 ? (
                    <View className='tipBox'>
                        <View className='tipMain'>
                            <View>?????????????????????, ?????????????????????????????????</View>
                            <View>?????????????????????????????????????????????????????????</View>
                        </View>
                        <Image className='ButtonPNG' src={ButtonPNG} />
                        <Image className='ArrowPNG' src={ArrowPNG} />
                        <View className='tipArrow'>?????????????????? ??????</View>
                        <Button className='btn' open-type='getPhoneNumber' onGetPhoneNumber={getPhoneNumber}>
                            ????????????
                        </Button>
                        <View className='bg' />
                        <Image className='BlockPNG' src={BlockPNG} />
                    </View>
                ) : null
            }
            {
                step3 ? (
                    <View className='searchBox'>
                        <View className='imageWrap'>
                            <Image src={HeaderIcon} className='img' />
                        </View>
                        <ScrollView className='scrollView' scrollY style={{ height: listHeight }}>
                            {
                                    devicesList.filter(item=>item.name)?.map((item) => (
                                        <View className='item' key={item.deviceId} onClick={() => Connect(item)}>
                                            <Image src={bleIcon} className='img' />
                                            <View className='name'>{item.name}</View>
                                            <View className='deviceId'>??????id: {getShortenAddress(item.deviceId)}</View>
                                            <View className='rssi'>????????????RSSI: {item.RSSI}</View>
                                        </View>
                                    ))
                            }
                        </ScrollView>
                        <View className='btnWrap'>
                            <Button className='btn' onClick={() => Search()}>
                                {searching && <Image className='icon' src={LoadingGif} />}
                                <View>{searching ? "?????????..." : "??????????????????"}</View>
                            </Button>
                        </View>
                    </View>
                ) : null
            }
        </View>
    );
}
