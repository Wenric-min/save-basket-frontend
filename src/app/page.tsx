"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 1. 사장님(OWNER) 전용 대시보드 컴포넌트
function OwnerDashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">사장님 대시보드 🏪</h2>
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
        <p className="text-gray-700">여기에 내 점포 관리, 마감 상품 등록 버튼 등이 들어갈 예정입니다.</p>
        <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          + 마감 상품 등록하기
        </button>
      </div>
    </div>
  );
}
//내 예약 내역 컴포넌트
function MyOrders({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false); // 더보기 클릭 여부

  // 데이터 불러오기 함수 (삭제 후 재로딩을 위해 따로 분리)
  const fetchOrders = () => {
    fetch(`http://localhost:8000/my-orders/${userId}`)
      .then(res => res.json())
      .then(data => setOrders(data.reverse())); // 최신순으로 보여주기 위해 뒤집기
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  // 예약 취소(삭제) 함수
  const handleDelete = async (orderId: number) => {
    if (!confirm("정말 예약을 취소하시겠습니까? (재고가 복구됩니다)")) return;

    try {
      const response = await fetch(`http://localhost:8000/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("예약이 취소되었습니다.");
        fetchOrders(); // 목록 새로고침
      }
    } catch (error) {
      alert("취소 처리 중 오류가 발생했습니다.");
    }
  };

  // 현재 보여줄 리스트 (전체보기면 다 보여주고, 아니면 상위 3개만)
  const displayedOrders = showAll ? orders : orders.slice(0, 3);

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">나의 예약 내역 📋</h2>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-10">아직 예약한 상품이 없어요.</p>
        ) : (
          <>
            {displayedOrders.map((order) => (
              <div key={order.order_id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 relative">
                {/* 삭제 버튼 (우측 상단 X 표시) */}
                <button
                  onClick={() => handleDelete(order.order_id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg"
                >
                  ✕
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {order.status === "PENDING" ? "픽업 대기 중" : "완료"}
                  </span>
                </div>

                <p className="font-bold text-lg pr-6">{order.product_name}</p>
                <p className="text-gray-600 text-sm">{order.quantity}개 / {order.total_price.toLocaleString()}원</p>
                <p className="text-xs text-red-500 mt-2 font-medium">🕒 픽업 마감: {order.pickup_deadline}</p>
              </div>
            ))}

            {/* 주문이 3개보다 많을 때만 [더보기] 버튼 노출 */}
            {!showAll && orders.length > 3 && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 text-sm text-blue-600 font-bold bg-blue-50 rounded-lg border border-blue-100 mt-2"
              >
                + 예약 내역 더보기
              </button>
            )}

            {showAll && (
              <button
                onClick={() => setShowAll(false)}
                className="w-full py-2 text-sm text-gray-400 font-medium"
              >
                접기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 2. 일반 학생(CONSUMER) 전용 피드 컴포넌트
function ConsumerDashboard({ userId }: { userId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: number]: number }>({});
  const [activeCategory, setActiveCategory] = useState<string>("전체");

  const categories = ["전체", "편의점", "베이커리", "도시락/식당"];

  useEffect(() => {
    fetch("http://localhost:8000/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        const initialQuantities: { [key: number]: number } = {};
        data.forEach((p: any) => { initialQuantities[p.product_id] = 1; });
        setSelectedQuantities(initialQuantities);
      })
      .catch((err) => alert("상품을 불러오지 못했습니다."));
  }, []);

  const handleReserve = async (productId: number) => {
    const quantity = selectedQuantities[productId];
    try {
      const response = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: parseInt(userId), product_id: productId, quantity }),
      });
      if (response.ok) {
        alert(`${quantity}개 예약이 완료되었습니다!`);
        window.location.reload();
      } else {
        alert((await response.json()).detail);
      }
    } catch (error) {
      alert("서버 연결 에러!");
    }
  };

  const handleQuantityChange = (productId: number, qty: number) => {
    setSelectedQuantities({ ...selectedQuantities, [productId]: qty });
  };

  // 🚀 핵심 필터링 로직: 이름 안에 '[편의점]' 이 포함되어 있는지 확인!
  const filteredProducts = activeCategory === "전체"
    ? products
    : products.filter((p) => p.name.includes("[" + activeCategory + "]"));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-4">오늘의 마감 할인 🍞</h2>

      {/* 카테고리 탭 (가로 스크롤) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeCategory === category
                ? "bg-green-500 text-white shadow-md"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-10">해당 카테고리에 남은 상품이 없습니다.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.product_id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg text-green-700">{product.name}</p>
                  <p className="text-sm text-gray-500 line-through mt-1">{product.original_price}원</p>
                  <p className="text-xl text-red-500 font-bold">{product.discount_price}원</p>
                </div>
                <div className="text-right">
                  <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">
                    남은 수량: {product.stock_quantity}개
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 mb-2">
                <label className="text-sm font-bold text-gray-700">수량 선택:</label>
                <select
                  value={selectedQuantities[product.product_id] || 1}
                  onChange={(e) => handleQuantityChange(product.product_id, parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500"
                >
                  {[...Array(product.stock_quantity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}개</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleReserve(product.product_id)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-bold shadow-sm"
              >
                예약하기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
//메인페이지
export default function MainPage() {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "orders">("home"); // 현재 보고 있는 탭

  useEffect(() => {
    const ownerStatus = localStorage.getItem("is_owner");
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      router.push("/login");
    } else {
      setIsOwner(ownerStatus === "true");
      setUserId(storedUserId);
    }
  }, [router]);

  if (isOwner === null || userId === null) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* 하단 탭 바 높이만큼 여백 */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-black text-orange-600">SAVE BASKET</h1>
        <button onClick={() => { localStorage.clear(); router.push("/login"); }} className="text-sm text-gray-400">로그아웃</button>
      </header>

      <main className="max-w-md mx-auto">
        {isOwner ? (
          <OwnerDashboard />
        ) : (
          // 학생일 경우 탭에 따라 다른 컴포넌트를 보여줍니다.
          activeTab === "home" ? <ConsumerDashboard userId={userId} /> : <MyOrders userId={userId} />
        )}
      </main>

      {/* 학생 전용 하단 네비게이션 바 */}
      {!isOwner && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center ${activeTab === "home" ? "text-orange-500" : "text-gray-400"}`}
          >
            <span className="text-xs font-bold">홈 (상품목록)</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex flex-col items-center ${activeTab === "orders" ? "text-orange-500" : "text-gray-400"}`}
          >
            <span className="text-xs font-bold">내 예약</span>
          </button>
        </nav>
      )}
    </div>
  );
}