import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SubmissionSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState('');
    const [isWechatQR, setIsWechatQR] = useState(true);

    useEffect(() => {
        // 从路由状态获取订单号
        const orderIdFromState = location.state?.orderId;
        
        if (!orderIdFromState) {
            // 如果没有订单号，重定向到首页
            navigate('/', { replace: true });
            return;
        }
        
        setOrderId(orderIdFromState);

        // 根据浏览器语言判断显示微信还是WhatsApp二维码
        const language = navigator.language || navigator.userLanguage;
        setIsWechatQR(language.startsWith('zh'));
    }, [location, navigate]);

    const handleBackToHome = () => {
        navigate('/');
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* 成功图标与提示 */}
                <div className="bg-green-50 border-b border-green-100 p-6 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-green-700 mb-2 font-song">
                        太棒了！您的定制需求已成功提交！
                    </h1>
                </div>

                {/* 核心引流模块 */}
                <div className="p-6 text-center">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 font-song">
                        请立即扫描下方二维码，添加您的专属艺术顾问
                    </h2>
                    
                    {/* 二维码切换按钮 */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-gray-100 rounded-lg p-1 flex">
                            <button
                                onClick={() => setIsWechatQR(true)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isWechatQR 
                                        ? 'bg-green-500 text-white' 
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                微信
                            </button>
                            <button
                                onClick={() => setIsWechatQR(false)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    !isWechatQR 
                                        ? 'bg-green-500 text-white' 
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                WhatsApp
                            </button>
                        </div>
                    </div>

                    {/* 二维码图片 */}
                    <div className="mb-6">
                        <img
                            src={isWechatQR 
                                ? '/pictures/WechatQRcode.JPG' 
                                : '/pictures/WhatsappQRcode.jpg'
                            }
                            alt={isWechatQR ? '微信二维码' : 'WhatsApp二维码'}
                            className="w-48 h-48 mx-auto rounded-lg shadow-md"
                        />
                    </div>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        顾问会在 <span className="font-semibold text-green-600">1-2 天内</span>，
                        将您的爱宠画像初稿通过{isWechatQR ? '微信' : 'WhatsApp'}发送给您，
                        并与您沟通后续微调、选框及下单事宜。
                    </p>
                </div>

                {/* 订单号显示模块 */}
                <div className="bg-gray-50 p-6 border-t">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">订单号</h3>
                        <div className="bg-white p-3 rounded-lg border-2 border-dashed border-gray-300">
                            <span className="text-xl font-mono font-bold text-blue-600">
                                {orderId}
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800 leading-relaxed">
                            <span className="font-semibold">重要提示：</span>
                            请您截图保存当前界面。添加顾问后，请将此包含订单号的截图发送给他，
                            以便我们快速核对您的需求。
                        </p>
                    </div>

                    <button
                        onClick={handleBackToHome}
                        className="w-full bg-[#D2B48C] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionSuccess;