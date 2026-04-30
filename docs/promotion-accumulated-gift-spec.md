# Promotion Spec: Tich luy mua hang tu quay nhan qua

## 1. Muc tieu

Xay dung campaign khuyen mai dang tich luy mua hang theo thoi gian, ap dung cho mot danh sach san pham duoc chon.

Khi khach hang mua cac san pham hop le trong thoi gian campaign, he thong cong don gia tri mua hang theo gia ban thuc te tren hoa don. Moi khi tong tich luy vuot them 1 nguong, khach duoc cong 1 luot quay.

Khach hang tu vao Next.js de quay nhan qua. Admin khong chon nguoi trung thuong thu cong nua.

## 2. Pham vi phien ban dau

Phien ban dau ho tro:

- Tao campaign tich luy theo thoi gian.
- Chon danh sach san pham ap dung.
- Tinh tich luy theo `total_price` tren dong hang hoa don.
- Dinh danh khach hang bang `customer_id`.
- Tru lai tich luy neu don hang bi huy hoac hoan.
- Cong luot quay theo moi lan vuot nguong.
- Khach tu quay tren Next.js.
- Admin set co cau qua tang, so luong moi loai qua, gia tri moi loai qua.
- Gia tri qua tang duoc ghi nhan vao chi phi khuyen mai de tinh loi nhuan sau nay.
- Chia quota qua theo thang va quota du thang truoc duoc cong sang thang sau.
- Mot khach toi da trung 2 lan / 1 campaign.
- Neu da trung 1 lan thi cac luot quay tiep theo chi con `2%` kha nang trung them lan 2.
- Neu da trung 2 lan thi van co the quay neu con luot, nhung luon ra `khong trung`.
- Lan trung thuong thu 2 khong duoc trung lai cung loai qua da trung truoc do.
- Khi quay trung phai tru / reserve qua ngay.
- Admin xac nhan da trao qua sau.

Phien ban dau chua can:

- Quay theo ngay hoac theo tuan.
- 1 campaign co nhieu moc nguong khac nhau.
- Hoan lai quota qua da reserve.
- Tu dong tao don tang qua.

Nguyen tac nhap lieu quan trong:

- Admin khong nhap moi `tong ngan sach campaign`.
- Admin phai nhap theo `co cau qua thuc te`.
- Moi loai qua can co:
  - `rewardName`
  - `rewardValue`
  - `totalQuantity`
- He thong tu suy ra:
  - tong so qua toi da
  - tong gia tri qua toi da cua campaign
  - chi phi khuyen mai da phat sinh thuc te

## 3. Dinh nghia nghiep vu

### 3.1 Loai campaign

Loai campaign: `accumulated_purchase_spin_reward`

Ban chat:

- Campaign co thoi gian bat dau va ket thuc do admin cai dat.
- Campaign ap dung cho danh sach san pham cu the.
- Mot hoa don co the duoc cong full vao nhieu campaign cung luc neu thoa dieu kien cua tung campaign.
- Muc tieu cua campaign la tao luot quay, khong phai dua vao danh sach de admin chon tay.

### 3.2 Dieu kien duoc tinh

Mot dong hang duoc tinh vao campaign khi thoa tat ca dieu kien:

- Hoa don nam trong thoi gian campaign.
- Hoa don thuoc khach hang hop le.
- San pham trong dong hang nam trong danh sach san pham ap dung.
- Hoa don o trang thai `da xac nhan`.

### 3.3 Loai tru khach hang

Khach hang duoc dinh danh bang `customer_id`.

Phien ban dau:

- Chi tinh cho user da dang nhap va co `customer_id` hop le.
- Backend map user dang nhap sang `customer_id`.
- Khong co luong quay cho khach vang lai.

### 3.4 Gia tri tinh tich luy

Cong thuc:

`qualifiedLineAmount = total_price`

Nguyen tac:

- Lay gia tai hoa don, khong lay gia hien tai trong bang san pham.
- `total_price` la gia tri thuc te cua dong hang sau giam gia dong.
- Khong tinh thue trong phien ban dau.

### 3.5 Quy tac cong luot quay

- Moi khi tong tich luy vuot them 1 nguong thi cong 1 luot quay.
- Vi du nguong `5.000.000`, khach tich luy `12.000.000` thi co `2 luot quay`.
- Luot quay duoc cong don trong suot campaign.
- Quay 1 lan thi tru 1 luot, du trung hay khong.

### 3.6 Quy tac trung thuong

- Tong so qua toan campaign duoc khoa cung theo cau hinh admin.
- Qua duoc chia quota theo thang.
- Quota thang du neu chua dung het se duoc cong sang thang sau.
- Neu quota thang hien tai da het nhung campaign thang sau con qua thi khach van quay duoc, nhung ket qua se la `khong trung`.
- Khach chua tung trung thi dung xac suat co ban cua campaign.
- Khach da trung 1 lan thi cac luot quay con lai chi con `2%` kha nang trung lan 2.
- Khach da trung 2 lan thi luon ra `khong trung`.
- Lan trung thuong thu 2 khong duoc trung lai cung loai qua da trung truoc do.

### 3.7 Chot qua va cap qua

- Khi quay trung, he thong phai `reserve` qua ngay luc do.
- Qua da reserve duoc xem nhu da bi tru kho khuyen mai.
- Sau do admin vao xac nhan da trao qua.
- Gia tri qua trung duoc ghi vao chi phi khuyen mai de tinh loi nhuan.

### 3.8 Chong race condition

Rule bat buoc:

- Neu con 1 qua ma 2 khach quay cung luc, chi 1 nguoi duoc trung.
- Backend phai xu ly giong chong ban qua ton kho.
- Khong duoc de 2 request cung reserve cung 1 phan qua cuoi.

Nguyen tac ky thuat:

- Xu ly bang transaction.
- Lock dong du lieu quota qua / release bucket truoc khi tru.
- Kiem tra lai so luong con sau khi lock.
- Neu reserve thanh cong moi tra ket qua `trung`.
- Neu het qua thi tra `khong trung`.

### 3.9 Huy don va hoan don

Neu hoa don da duoc cong tich luy truoc do ma sau nay:

- bi huy
- bi hoan toan bo
- hoan mot phan lien quan den cac dong hang hop le

thi he thong phai tru lai phan gia tri da cong tu hoa don do.

Nguyen tac:

- Moi phep cong/tru phai truy vet duoc theo tung hoa don.
- Ledger phai du chinh xac de tinh lai tong tich luy va tong luot quay da dat.

## 4. Muc tieu quan ly admin

Admin can co kha nang:

- Tao campaign moi.
- Chon thoi gian campaign: 3 thang, 3.5 thang, 4 thang, hoac tuy chon.
- Chon danh sach san pham ap dung.
- Dat nguong gia tri de cong 1 luot quay.
- Nhap xac suat co ban de quay trung.
- Xem tong tich luy va tong luot quay cua khach.
- Tao danh sach loai qua.
- Nhap so luong moi loai qua.
- Nhap gia tri moi loai qua de tinh chi phi khuyen mai.
- Khong nhap tong ngan sach thu cong; tong ngan sach toi da do he thong tu tinh tu co cau qua.
- Chia quota moi loai qua theo thang.
- Xem so luot quay da dung, so luot trung, so qua con lai.
- Xac nhan da trao qua.
- Xem tong chi phi khuyen mai da ghi nhan.
- Xem tong so qua toi da va tong gia tri qua toi da cua campaign do he thong tu tinh.

## 5. De xuat mo hinh du lieu

### 5.1 Bang `promotions`

Muc dich: luu thong tin campaign.

Truong de xuat:

- `id`
- `code`
- `name`
- `type`
- `status`
- `startAt`
- `endAt`
- `thresholdAmount`
- `baseWinRate`
- `secondWinRate`
- `maxWinPerCustomer`
- `rewardReleaseMode`
- `notes`
- `createdBy`
- `createdAt`
- `updatedAt`

Gia tri de xuat:

- `type = accumulated_purchase_spin_reward`
- `status = draft | active | ended | archived`
- `secondWinRate = 0.02`
- `maxWinPerCustomer = 2`
- `rewardReleaseMode = monthly`

### 5.2 Bang `promotion_products`

Muc dich: mapping giua campaign va san pham duoc ap dung.

Truong de xuat:

- `id`
- `promotionId`
- `productId`
- `productNameSnapshot`
- `createdAt`

### 5.3 Bang `customer_promotion_progress`

Muc dich: tong hop trang thai tich luy va quay cua tung khach trong tung campaign.

Truong de xuat:

- `id`
- `promotionId`
- `customerId`
- `qualifiedAmount`
- `qualifiedOrderCount`
- `earnedSpinCount`
- `usedSpinCount`
- `remainingSpinCount`
- `winCount`
- `lastCalculatedAt`
- `createdAt`
- `updatedAt`

### 5.4 Bang `customer_promotion_ledger`

Muc dich: luu tung bien dong cong/tru tich luy de co the audit va rollback chinh xac.

Truong de xuat:

- `id`
- `promotionId`
- `customerId`
- `orderId`
- `orderCode`
- `orderItemId`
- `productId`
- `changeType`
- `amountDelta`
- `quantityDelta`
- `sourceStatus`
- `eventAt`
- `note`
- `createdAt`

### 5.5 Bang `promotion_reward_pool`

Muc dich: luu co cau qua tang tong cua campaign.

Day la noi admin nhap lieu chinh cho qua tang.

Admin nhap theo tung dong qua thuc te, khong nhap 1 con so tong ngan sach duy nhat.

Truong de xuat:

- `id`
- `promotionId`
- `rewardCode`
- `rewardName`
- `rewardValue`
- `totalQuantity`
- `remainingQuantity`
- `reservedQuantity`
- `issuedQuantity`
- `sortOrder`
- `createdAt`
- `updatedAt`

### 5.6 Bang `promotion_reward_release_schedule`

Muc dich: chia quota qua theo thang.

Truong de xuat:

- `id`
- `promotionId`
- `rewardPoolId`
- `bucketMonth`
- `releaseQuantity`
- `remainingReleaseQuantity`
- `carryForwardIn`
- `carryForwardOut`
- `createdAt`
- `updatedAt`

### 5.7 Bang `customer_promotion_spin_logs`

Muc dich: luu tung luot quay cua khach.

Truong de xuat:

- `id`
- `promotionId`
- `customerId`
- `spinNo`
- `resultType`
- `rewardPoolId`
- `rewardName`
- `rewardValue`
- `winProbabilityApplied`
- `customerWinCountBeforeSpin`
- `spunAt`
- `note`

Gia tri de xuat:

- `resultType = win | lose`

### 5.8 Bang `promotion_reward_reservations`

Muc dich: luu viec reserve qua ngay luc quay trung.

Truong de xuat:

- `id`
- `promotionId`
- `customerId`
- `spinLogId`
- `rewardPoolId`
- `rewardName`
- `rewardValue`
- `status`
- `reservedAt`
- `issuedAt`
- `issuedBy`
- `expensePostedAt`
- `note`

Gia tri de xuat:

- `status = reserved | issued | cancelled`

## 6. Rule xu ly chi tiet

### 6.1 Tao campaign

Khi tao campaign, admin phai nhap:

- Ten campaign
- Thoi gian bat dau
- Thoi gian ket thuc
- Nguong gia tri de cong 1 luot quay
- Xac suat trung co ban
- Danh sach san pham ap dung
- Danh sach loai qua, so luong va gia tri qua
- Quota phat hanh theo thang cho tung loai qua

### 6.2 Cong tich luy va cong luot quay

Khi hoa don hop le duoc xac nhan:

1. Xac dinh cac dong hang thuoc campaign.
2. Cong vao ledger.
3. Tinh lai `qualifiedAmount`.
4. Tinh `earnedSpinCount = floor(qualifiedAmount / thresholdAmount)`.
5. Tinh `remainingSpinCount = earnedSpinCount - usedSpinCount`.

### 6.3 Quay thuong

Khi khach bam quay:

1. Kiem tra campaign con hieu luc.
2. Kiem tra khach con `remainingSpinCount > 0`.
3. Truoc tien tru 1 luot quay.
4. Xac dinh `winCount` hien tai cua khach.
5. Neu `winCount >= 2` thi ket qua la `khong trung`.
6. Neu `winCount = 1` thi xac suat trung la `2%`.
7. Neu `winCount = 0` thi dung `baseWinRate`.
8. Neu random ra `khong trung` thi ghi `spin log`.
9. Neu random ra `trung` thi loc pool qua hop le:
   - con trong quota thang hien tai sau carry forward
   - con `remainingQuantity > 0`
   - neu day la lan trung thu 2 thi loai bo nhung loai qua da trung truoc do
10. Mo transaction.
11. Lock dong quota qua can reserve.
12. Kiem tra lai so luong con.
13. Neu reserve thanh cong:
   - tru `remainingQuantity`
   - tang `reservedQuantity`
   - ghi `spin log = win`
   - tao `reward reservation`
14. Neu reserve that bai:
   - ghi `spin log = lose`
15. Commit transaction.

### 6.4 Carry forward quota theo thang

- Moi loai qua co quota release cho tung thang.
- Cuoi moi thang, quota chua dung het duoc chuyen sang thang sau.
- Neu thang hien tai het quota release thi khach van quay duoc, nhung ket qua se la `khong trung`.

### 6.5 Xac nhan trao qua

Admin vao danh sach qua da reserve va xac nhan da trao.

Sau khi xac nhan:

- `reservation.status = issued`
- `issuedQuantity` tang
- `promotion expense` duoc ghi nhan theo `rewardValue`

### 6.6 Huy / hoan don

Neu hoa don bi huy hoac hoan:

- Tru lai ledger.
- Tinh lai `qualifiedAmount`.
- Tinh lai `earnedSpinCount`.
- `remainingSpinCount` giam theo cong thuc moi.

Phien ban dau khong tu dong thu hoi qua da quay trung.

## 7. Bao cao va loi nhuan

Gia tri qua tang duoc admin nhap tay cho tung loai qua.

Bao cao can tach ro:

- `Tong gia tri qua toi da`:
  - duoc tinh tu `sum(rewardValue * totalQuantity)` cua toan bo co cau qua campaign
- `Tong so qua toi da`:
  - duoc tinh tu `sum(totalQuantity)`
- `Chi phi khuyen mai da phat sinh`:
  - chi tang khi qua da duoc xac nhan `issued`
  - khong chi dua vao viec tao campaign hay reserve qua

Vi vay:

- `reward configuration` la du lieu admin nhap vao
- `tong ngan sach toi da` la so he thong suy ra
- `chi phi thuc te` la so he thong ghi nhan sau khi trao qua

Gia tri nay duoc dung de:

- Ghi nhan chi phi khuyen mai khi quà da duoc trao.
- Tong hop chi phi khuyen mai theo campaign.
- Tinh loi nhuan sau khi tru chi phi qua tang.

Nguyen tac:

- Qua reserve chua chac da tinh chi phi neu chua trao.
- Qua da `issued` thi phai duoc dua vao chi phi.

## 8. Giao dien admin

Trang campaign can co:

- Form tao / sua campaign
- Tab san pham ap dung
- Tab co cau qua tang
- Tab quota qua theo thang
- Tab tien do tich luy va so luot quay cua khach
- Tab lich su quay
- Tab qua da reserve
- Tab qua da trao

## 9. Giao dien khach hang Next.js

Route de xuat:

- `/rewards`

Khach hang can xem:

- Campaign dang tham gia
- Tong gia tri da tich luy
- Tong so luot quay da co
- Tong so luot quay con lai
- Qua da trung
- Nut quay neu con luot

## 10. Case can test

- 1 hoa don vao 1 campaign
- 1 hoa don vao nhieu campaign
- Dat nguong 1 lan
- Vuot nhieu nguong va cong don nhieu luot quay
- Quay khong trung va bi tru luot
- Quay trung lan 1
- Quay trung lan 2 voi xac suat 2%
- Sau 2 lan trung thi cac luot sau luon khong trung
- Lan trung thu 2 khong trung lai cung loai qua
- Het quota thang hien tai thi quay ra khong trung
- Carry forward quota thang sau dung
- Con 1 qua ma 2 khach quay cung luc thi chi 1 nguoi reserve duoc
- Huy / hoan don lam giam lai tich luy va luot quay

## 11. Mo rong sau

- Chia release theo tuan thay vi theo thang
- Them voucher va qua phi vat ly cung luc
- Them co che het han reserve neu khach khong den nhan
- Them dashboard xac suat va du bao toc do phat qua

## 12. Customer Portal tren Next.js

Phan khach hang tren Next.js da duoc tach thanh 3 tai lieu rieng:

- `promotion-customer-portal-api-contract.md`
- `promotion-customer-portal-wireframe.md`
- `promotion-customer-portal-implementation-checklist.md`
