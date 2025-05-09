import QuickResults from "@/pages/QuickResults";

import Logo from "@/assets/imgs/stmary_logo.png";

const DefaultLayout: React.FC = function () {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-10 py-20">
            <img src={Logo} alt="St Mary Ztn logo" className="mb-6 mt-8 w-36"></img>
            <div className="text-center">
                <h3 className="mb-6 text-lg">كنيسة السيدة العذراء مريم بالزيتون</h3>
                <h1 className="mb-4 text-2xl font-bold">إعداد خدام</h1>
                <h2 className="mb-6 text-xl">Student Information Portal | بوابة معلومات الطالب</h2>
            </div>
            <QuickResults />
        </div>
    );
};

export default DefaultLayout;
