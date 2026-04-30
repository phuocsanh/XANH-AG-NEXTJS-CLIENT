# Promotion Implementation Roadmap

## 1. Muc tieu

Tai lieu nay tach task backend/frontend theo thu tu lam thuc te de implement campaign tich luy tu quay nhan qua.

## 2. Thu tu uu tien tong

1. Chot data model va rule backend
2. Lam backend campaign admin
3. Lam accumulation engine
4. Lam spin engine + anti-oversell
5. Lam giao dien admin
6. Nang cap trang `/rewards` cho khach hang
7. Test end-to-end

## 3. Backend phase 1: data model

- Tao schema `promotions`
- Tao schema `promotion_products`
- Tao schema `customer_promotion_progress`
- Tao schema `customer_promotion_ledger`
- Tao schema `promotion_reward_pool`
- Tao schema `promotion_reward_release_schedule`
- Tao schema `customer_promotion_spin_logs`
- Tao schema `promotion_reward_reservations`

## 4. Backend phase 2: campaign admin APIs

- API tao / sua campaign
- API active / end campaign
- API danh sach campaign
- API chi tiet campaign
- API quan ly co cau qua
- API quan ly quota release theo thang

## 5. Backend phase 3: accumulation engine

- Cong tich luy khi hoa don `da xac nhan`
- Tru lai khi huy / hoan
- Tinh `earnedSpinCount = floor(qualifiedAmount / thresholdAmount)`
- Tinh `remainingSpinCount`

## 6. Backend phase 4: spin engine

- API quay thuong cho khach
- API lich su quay
- Rule lan 2 con `2%`
- Rule toi da 2 lan trung / campaign
- Rule lan 2 khong trung lai cung loai qua
- Rule het quota thang hien tai thi quay ra `khong trung`
- Transaction + row lock de chong oversell qua

## 7. Backend phase 5: reward fulfillment

- API danh sach qua da reserve
- API xac nhan da trao qua
- Ghi chi phi khuyen mai theo `rewardValue`

## 8. Frontend admin

- Trang danh sach campaign
- Trang tao / sua campaign
- Tab san pham ap dung
- Tab co cau qua tang
- Tab quota qua theo thang
- Tab lich su quay
- Tab qua da reserve
- Tab qua da trao

## 9. Frontend customer

- Tai su dung route `/rewards`
- Hook lay progress campaign
- Hook quay thuong
- Hook lich su quay
- Card campaign
- Nut quay
- Modal quay

## 10. QA va rollout

- Test cong don nhieu luot quay
- Test quay khong trung
- Test quay trung lan 1
- Test quay trung lan 2
- Test da trung 2 lan thi luon khong trung
- Test lan 2 khong trung lai cung loai qua
- Test carry forward quota theo thang
- Test con 1 qua va 2 khach quay cung luc
- Test ghi nhan chi phi khuyen mai sau khi admin xac nhan trao
