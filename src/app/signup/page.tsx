"use client"; // Next.js에게 이 컴포넌트는 사용자와 상호작용(입력, 클릭)한다고 알려주는 필수 키워드입니다.

import { useState } from "react";

export default function SignupPage() {
    // 1. 사용자가 입력할 데이터를 담아둘 상태(State) 바구니입니다.
    const [formData, setFormData] = useState({
        login_id: "",
        password: "",
        password_confirm: "",
        phone: "",
        role_type: "CONSUMER", // 기본값은 일반 학생
        business_number: "",
    });

    // 2. 사용자가 글자를 입력할 때마다 바구니를 업데이트하는 함수
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. [가입하기] 버튼을 눌렀을 때 백엔드로 데이터를 쏘는 핵심 로직!
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // 버튼 눌렀을 때 새로고침 되는 기본 현상 방지

        // 프론트엔드 1차 방어막: 비밀번호 일치 확인
        if (formData.password !== formData.password_confirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // 파이썬(FastAPI) 서버로 JSON 택배를 던집니다!
            const response = await fetch("http://127.0.0.1:8000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData), // 바구니 안의 데이터를 문자열로 압축
            });

            const result = await response.json();

            if (response.ok) {
                alert(`회원가입 성공! 환영합니다, ${result.login_id}님!`);
                // TODO: 나중에 로그인 페이지로 자동 이동(라우팅)하는 코드 추가
            } else {
                alert("가입 실패: " + JSON.stringify(result.detail));
            }
        } catch (error) {
            alert("백엔드 서버와 연결할 수 없습니다. 파이썬 서버가 켜져 있나요?");
        }
    };

    // 4. 화면(UI)을 그리는 부분 (Tailwind CSS로 모바일 화면처럼 뼈대 잡기)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-center mb-6">세이브 바스켓 회원가입</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">아이디</label>
                        <input type="text" name="login_id" value={formData.login_id} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
                        <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">전화번호</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-1234-5678"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>

                    {/* 역할 선택 (점주 or 소비자) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">가입 유형</label>
                        <select name="role_type" value={formData.role_type} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="CONSUMER">일반 학생 (소비자)</option>
                            <option value="OWNER">가게 사장님 (점주)</option>
                        </select>
                    </div>

                    {/* 사장님을 선택했을 때만 나타나는 사업자 번호 입력칸 */}
                    {formData.role_type === "OWNER" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">사업자등록번호</label>
                            <input type="text" name="business_number" value={formData.business_number} onChange={handleChange} placeholder="000-00-00000"
                                className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500" required />
                        </div>
                    )}

                    <button type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none">
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
}