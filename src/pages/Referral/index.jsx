import React from 'react';

const Referral = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">推荐给朋友！</h1>
                <p className="text-gray-600 mb-6">喜欢我们的服务吗？把它分享给您的朋友，你们都可以获得特别优惠！</p>
                
                <div className="flex justify-center space-x-4 mb-6">
                    <img src="/pictures/WechatQRcode.JPG" alt="WeChat QR Code" className="w-32 h-32"/>
                    <img src="/pictures/WhatsappQRcode.jpg" alt="WhatsApp QR Code" className="w-32 h-32"/>
                </div>

                <p className="text-sm text-gray-500">使用微信或WhatsApp扫描二维码，或分享您的专属推荐链接。</p>

                <div className="mt-6">
                    <input 
                        type="text" 
                        readOnly 
                        value="https://pawsomeart.com/referral?code=USER123" 
                        className="w-full p-2 border rounded-md text-center bg-gray-50"
                    />
                    <button 
                        onClick={() => navigator.clipboard.writeText('https://pawsomeart.com/referral?code=USER123')} 
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors w-full"
                    >
                        复制链接
                    </button>
                </div>

                <button 
                    onClick={() => window.location.href = '/'} 
                    className="mt-8 text-sm text-blue-500 hover:underline"
                >
                    跳过，返回首页
                </button>
            </div>
        </div>
    );
};

export default Referral;