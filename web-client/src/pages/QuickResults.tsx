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
                    <div className="mt-6 lg:px-20" dir="rtl">
                        {fetchQuery.data?.Alert && (
                            <p className="mx-auto mb-2 w-fit rounded-md border-2 border-amber-600 border-opacity-65 bg-amber-500 bg-opacity-50 px-4 py-3 text-black">
                                تنبيه: {fetchQuery.data.Alert.replace('"', "")}
                            </p>
                        )}

                        <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                            <p className="text-lg">
                                الاسم بالعربي: <span className="font-semibold">{fetchQuery.data?.NameAr}</span>
                            </p>
                            <p className="text-lg">
                                الاسم بالإنجليزي: <span className="font-semibold">{fetchQuery.data?.NameEn}</span>
                            </p>
                            <p className="text-lg">
                                الهاتف:{" "}
                                <span
                                    className={
                                        "font-semibold " + (fetchQuery.data?.Phone.length !== 11 ? "text-red-600" : "")
                                    }
                                >
                                    {fetchQuery.data?.Phone ? (
                                        fetchQuery.data.Phone
                                    ) : (
                                        <span className="text-red-600">برجاء اكمال البيانات</span>
                                    )}
                                </span>
                            </p>
                            <p className="text-lg">
                                العنوان:{" "}
                                <span className="font-semibold">
                                    {fetchQuery.data?.Address ? (
                                        fetchQuery.data.Address
                                    ) : (
                                        <span className="text-red-600">برجاء اكمال البيانات</span>
                                    )}
                                </span>
                            </p>
                            <p className="text-lg">
                                المنطقة:{" "}
                                <span className="font-semibold">
                                    {fetchQuery.data?.Region ? (
                                        fetchQuery.data.Region
                                    ) : (
                                        <span className="text-red-600">برجاء اكمال البيانات</span>
                                    )}
                                </span>
                            </p>
                            <p className="text-lg">
                                تاريخ الميلاد:{" "}
                                <span className="font-semibold">
                                    {fetchQuery.data?.BirthDate.toDate().toLocaleDateString()}
                                </span>
                            </p>
                            <p className="text-lg">
                                اسم المجموعة: <span className="font-semibold">{fetchQuery.data?.GroupName}</span>
                            </p>
                            <p className="text-lg">
                                اسم الخادم: <span className="font-semibold">{fetchQuery.data?.ServantName}</span>
                            </p>
                            <p className="text-lg">
                                اسم أب الاعتراف:{" "}
                                <span className="font-semibold">
                                    {fetchQuery.data?.PenanceFather ? (
                                        fetchQuery.data.PenanceFather
                                    ) : (
                                        <span className="text-red-600">برجاء اكمال البيانات</span>
                                    )}
                                </span>
                            </p>
                            <p className="text-lg">
                                التزكية:{" "}
                                <span
                                    className={
                                        "font-semibold " +
                                        (fetchQuery.data?.RecommendationLetter.toLowerCase() === "done"
                                            ? ""
                                            : "text-red-600")
                                    }
                                >
                                    {fetchQuery.data?.RecommendationLetter}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-10">
                        <h4 className="mb-5 text-center text-xl font-bold">الحضور</h4>
                        <div className="mx-auto max-w-[calc(90svw)] overflow-x-auto">
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
                                                    {fetchQuery.data?.Attendance[key]
                                                        ? "✅"
                                                        : new Date(key) > new Date()
                                                          ? "🔵"
                                                          : "❌"}
                                                </td>
                                            ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default QuickResults;
