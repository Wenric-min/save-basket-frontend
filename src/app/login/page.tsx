"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 Next.js 훅

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        login_id: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`${result.login_id}님, 환영합니다!`);

                // MVP 임시 로직: 브라우저 저장소에 유저 정보 몰래 적어두기
                localStorage.setItem("user_id", result.user_id);
                localStorage.setItem("is_owner", result.is_owner);

                // 로그인 성공 시 메인 화면(대문)으로 강제 이동시킵니다!
                router.push("/");
            } else {
                alert(result.detail); // "아이디 또는 비밀번호가 틀렸습니다" 출력
            }
        } catch (error) {
            alert("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-center mb-6">세이브 바스켓 로그인</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">아이디</label>
                        <input type="text" name="login_id" value={formData.login_id} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>

                    <button type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700">
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
}