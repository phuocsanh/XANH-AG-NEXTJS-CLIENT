# Promotion Customer Portal Implementation Checklist

## 1. Muc tieu

Checklist nay tach nho cong viec de implement man hinh khach hang xem tien do tich luy va tu quay nhan qua tren Next.js.

## 2. Backend

- Dung `customer_id` lam dinh danh khach hang
- Tao service lay danh sach progress campaign theo khach hang
- Tinh san `earnedSpinCount`
- Tinh san `usedSpinCount`
- Tinh san `remainingSpinCount`
- Tinh san `winCount`
- Tao API `GET /api/customer/promotions/progress`
- Tao API `GET /api/customer/promotions/:promotionId/spins`
- Tao API `POST /api/customer/promotions/:promotionId/spin`
- Dam bao API spin co transaction va row lock
- Test cac case:
- khach chua du nguong
- khach du 1 luot quay
- khach quay khong trung
- khach quay trung lan 1
- khach quay trung lan 2 voi 2%
- khach da trung 2 lan thi chi ra khong trung
- 2 request quay cung luc khi con 1 qua

## 3. Frontend Next.js

- Ra soat va tan dung trang `/rewards`
- Goi API lay progress campaign
- Render danh sach card campaign
- Hien:
- ten campaign
- da tich luy
- so luot quay
- so luot quay con lai
- so lan da trung
- qua noi bat
- nut quay
- Tao modal / sheet quay thuong
- Goi API spin
- Cap nhat UI sau khi quay
- Them loading state, error state, empty state
- Toi uu mobile layout

## 4. Security

- Backend lay `customer_id` tu current user
- Khong nhan `customerId` tu frontend
- Chan spam request quay lien tuc neu can

## 5. QA

- Test voi user co 0 luot quay
- Test voi user co 1 luot quay
- Test voi user co nhieu luot quay cong don
- Test quay het luot
- Test quota thang da het
- Test lich su quay hien thi dung
- Test mobile
- Test desktop

## 6. Giai doan sau

- Them lich su qua da reserve / da trao
- Them countdown theo thang release quota
- Them animation quay nang cap
