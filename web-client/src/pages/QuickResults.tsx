import { db } from "@/firebase";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRef, useState } from "react";

// Types & Interfaces
import { UserData } from "@/types/userData";

const QuickResults: React.FC = function () {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // React States
    const [nationalId, setNationalId] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // React Refs
    const errorBoxRef = useRef<HTMLDivElement>(null);

    // TanStack Query
    const fetchQuery = useQuery({
        queryKey: ["fetchUserData"],
        enabled: false,
        queryFn: async () => {
            const dbQuery = query(collection(db, "user_data"), where("NationalId", "==", nationalId));
            const querySnapshot = await getDocs(dbQuery);
            if (querySnapshot.docs.length) {
                return querySnapshot.docs[0].data() as UserData;
            } else {
                setErrorMsg("لم يتم العثور على بيانات لهذا الرقم القومي");
                errorBoxRef.current!.classList.remove("hidden");
                return null;
            }
        },
    });

    // Methods
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        errorBoxRef.current!.classList.add("hidden");

        // Validation
        if (nationalId.length !== 14) {
            setErrorMsg("الرقم القومي يجب أن يكون 14 رقمًا");
            errorBoxRef.current!.classList.remove("hidden");
            return;
        }

        if (!nationalId.match(/^\d+$/)) {
            setErrorMsg("الرقم القومي يجب أن يحتوي على أرقام فقط");
            errorBoxRef.current!.classList.remove("hidden");
            return;
        }

        // Fetch data
        if (fetchQuery.isLoading) {
            return;
        }

        fetchQuery.refetch();
    }

    function perc2color(perc: number) {
        const darkenFactor = 0.7;

        let r,
            g = 0,
            b = 0;
        if (perc < 50) {
            r = 255;
            g = Math.round(5.1 * perc);
        } else {
            g = 255;
            r = Math.round(510 - 5.1 * perc);
        }

        // Apply darkening
        r = Math.round(r * darkenFactor);
        g = Math.round(g * darkenFactor);
        b = Math.round(b * darkenFactor);

        // Ensure RGB values are within the valid range [0, 255]
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        const h = r * 0x10000 + g * 0x100 + b * 0x1;
        return "#" + ("000000" + h.toString(16)).slice(-6);
    }

    return (
        <div className="my-3">
            <form onSubmit={(e) => handleSubmit(e)}>
                <div className="mx-auto mb-2 w-fit">
                    <input
                        type="text"
                        name="nationalId"
                        id="nationalId"
                        className="rounded border px-3 py-1 outline-none duration-200 focus:border-blue-500"
                        placeholder="National ID"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                    />
                    <label htmlFor="nationalId" className="mx-3">
                        الرقم القومي
                    </label>
                </div>

                <div ref={errorBoxRef} className="mt-5 hidden">
                    <p className="text-center text-red-500">{errorMsg}</p>
                </div>

                <input
                    type="submit"
                    value={fetchQuery.isLoading ? "Loading ..." : "بحث"}
                    disabled={fetchQuery.isLoading}
                    className="mx-auto mt-8 block rounded-full bg-blue-500 px-6 py-2 text-white duration-200 enabled:hover:bg-blue-600 disabled:opacity-75"
                />
            </form>

            {fetchQuery.isSuccess && (
                <>
                    {/* Basic Info */}
                    <div className="mt-6 lg:px-20" dir="rtl">
                        {fetchQuery.data?.Alert && (
                            <p className="mx-auto mb-2 w-fit rounded-md border-2 border-amber-600 border-opacity-65 bg-amber-500 bg-opacity-50 px-4 py-3 text-black">
                                تنبيه: {fetchQuery.data.Alert.replace('"', "")}
                            </p>
                        )}

                        <div className="mt-10 grid gap-4 text-lg grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                            <p>الاسم بالعربي</p>
                            <p className="font-semibold">{fetchQuery.data?.NameAr}</p>

                            <p>الاسم بالإنجليزي</p>
                            <p className="font-semibold">{fetchQuery.data?.NameEn}</p>

                            <p className="text-lg">الهاتف</p>
                            <p className={"font-semibold " + (fetchQuery.data?.Phone.length !== 11 ? "text-red-600" : "")}>
                                {fetchQuery.data?.Phone ? (
                                    fetchQuery.data.Phone
                                ) : (
                                    <span className="text-red-600">برجاء اكمال البيانات</span>
                                )}
                            </p>

                            <p>العنوان</p>
                            <p className="font-semibold">
                                {fetchQuery.data?.Address ? (
                                    fetchQuery.data.Address
                                ) : (
                                    <span className="text-red-600">برجاء اكمال البيانات</span>
                                )}
                            </p>

                            <p>المنطقة</p>
                            <p className="font-semibold">
                                {fetchQuery.data?.Region ? (
                                    fetchQuery.data.Region
                                ) : (
                                    <span className="text-red-600">برجاء اكمال البيانات</span>
                                )}
                            </p>

                            <p>تاريخ الميلاد</p>
                            <p className="font-semibold">{fetchQuery.data?.BirthDate.toDate().toLocaleDateString()}</p>

                            <p>اسم المجموعة</p>
                            <p className="font-semibold">{fetchQuery.data?.GroupName}</p>

                            <p>اسم الخادم</p>
                            <p className="font-semibold">{fetchQuery.data?.ServantName}</p>

                            <p>اسم أب الاعتراف</p>
                            <p className="font-semibold">
                                {fetchQuery.data?.PenanceFather ? (
                                    fetchQuery.data.PenanceFather
                                ) : (
                                    <span className="text-red-600">برجاء اكمال البيانات</span>
                                )}
                            </p>

                            <p>التزكية</p>
                            <p
                                className={
                                    "font-semibold " +
                                    (fetchQuery.data?.RecommendationLetter.toLowerCase() === "done" ? "" : "text-red-600")
                                }
                            >
                                {fetchQuery.data?.RecommendationLetter}
                            </p>
                        </div>
                    </div>

                    {/* Attendance */}
                    <div className="mt-14">
                        <h4 className="mb-5 text-center text-xl font-bold">الحضور</h4>
                        <p
                            className="mx-auto mb-5 w-fit rounded border px-4 py-1 text-center text-lg font-bold text-white"
                            style={{
                                backgroundColor: perc2color(
                                    Number(
                                        fetchQuery.data?.AttendanceRate.substring(
                                            0,
                                            fetchQuery.data?.AttendanceRate.length - 1
                                        )
                                    )
                                ),
                            }}
                        >
                            {`${fetchQuery.data?.AttendanceRate}${fetchQuery.data?.AttendanceRate.includes("%") ? "" : "%"}`}
                        </p>
                        <div className="mx-auto max-w-[calc(90vw)] overflow-x-auto">
                            <table className="mx-auto border-collapse">
                                <thead>
                                    <tr className="text-center">
                                        {Object.keys(fetchQuery.data?.Attendance || {})
                                            .sort()
                                            .map((key) => (
                                                <td key={key} className="p-2">
                                                    {months[Number(key.substring(5, 7)) - 1]}
                                                    <br />
                                                    {key.substring(8, 10)}
                                                </td>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center">
                                        {Object.keys(fetchQuery.data?.Attendance || {})
                                            .sort()
                                            .map((key) => (
                                                <td key={key} className="p-2">
                                                    {fetchQuery.data?.Attendance[key] === null && "🔵"}
                                                    {fetchQuery.data?.Attendance[key] === false && "❌"}
                                                    {fetchQuery.data?.Attendance[key] === true && "✅"}
                                                </td>
                                            ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quizzes */}
                    <div className="mt-14">
                        <h4 className="mb-5 text-center text-xl font-bold">Quizzes</h4>
                        <div className="mx-auto max-w-[calc(90vw)] overflow-x-auto">
                            <table className="mx-auto border-collapse">
                                <thead>
                                    <tr className="text-center">
                                        {Object.keys(fetchQuery.data?.Quizzes || {})
                                            .sort()
                                            .map((key) => (
                                                <td key={key} className="whitespace-pre p-2">
                                                    Quiz {Number(key.split("_")[0]) + 1}
                                                    <br />({key.split("_")[1]})
                                                </td>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center">
                                        {Object.keys(fetchQuery.data?.Quizzes || {})
                                            .sort()
                                            .map((key) => (
                                                <td key={key} className="p-2">
                                                    <p
                                                        className="mx-auto w-fit rounded px-3 py-0.5 text-white"
                                                        style={{
                                                            backgroundColor: perc2color(
                                                                (Number(fetchQuery.data?.Quizzes[key]) /
                                                                    Number(key.split("_")[1])) *
                                                                    100
                                                            ),
                                                        }}
                                                    >
                                                        {fetchQuery.data?.Quizzes[key]}
                                                    </p>
                                                </td>
                                            ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Grades */}
                    <div className="mt-14 lg:px-20" dir="rtl">
                        <h4 className="mb-5 text-center text-xl font-bold">Grades</h4>

                        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
                            {Object.keys(fetchQuery.data?.Grades || {})
                                .sort()
                                .map((key) => (
                                    <>
                                        <p key={`${key}1`} className="text-lg">
                                            {key.split("_")[0] == "01attendance" && "حضور"}
                                            {key.split("_")[0] == "02quizzes" && "Quizzes"}
                                            {key.split("_")[0] == "03hymns1" && "الالحان ترم اول"}
                                            {key.split("_")[0] == "04project" && "Project"}
                                            {key.split("_")[0] == "05recitations" && "محفوظات"}
                                            {key.split("_")[0] == "06hymns2" && "الالحان ترم تاني"}
                                            {key.split("_")[0] == "07research" && "بحث"}
                                            {key.split("_")[0] == "08exam1" && "Exam 1st Term"}
                                            {key.split("_")[0] == "09exam2" && "Exam 2nd Term"}
                                            {key.split("_")[0] == "10total" && "Total"}
                                            {key.split("_")[0] == "11grade" && "Grade"} ({key.split("_")[1]})
                                        </p>

                                        <p key={`${key}2`} className="w-fit rounded border px-2 py-0.5 font-semibold">
                                            {fetchQuery.data?.Grades[key] || 0}
                                        </p>
                                    </>
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default QuickResults;
