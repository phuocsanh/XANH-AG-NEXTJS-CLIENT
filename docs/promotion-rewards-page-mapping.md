# Rewards Page Mapping

## 1. Muc tieu

Tai lieu nay doi chieu trang `/rewards` hien co trong Next.js voi spec campaign moi de xac dinh:

- Phan nao co the tai su dung
- Phan nao can sua
- Phan nao can bo sung API/backend

## 2. Hien trang tu code

Trang hien co:

- Route: `/rewards`
- File: `src/app/(public)/rewards/page.tsx`
- Dang dung:
  - `useCurrentUser()`
  - `useMyRewardTracking()`
  - `useMyRewardHistory()`

Trang hien tai da co:

- Kiem tra login
- Header profile nguoi dung
- Tab tong quan
- Tab lich su qua tang
- Thanh progress
- Hien tong da tich luy
- Hien so tien con thieu
- Hien so lan da nhan qua

## 3. Phan phu hop voi spec moi

Co the giu va tai su dung:

- Route `/rewards`
- Cau truc tong quan + lich su
- UI progress card
- Login gate dua tren `useCurrentUser()`
- Pattern loading / empty / history

## 4. Phan chua khop spec moi

Trang hien tai dang theo mo hinh cu:

- 1 chuong trinh tich luy tong
- 1 moc co dinh
- thong diep tri an co dinh

Spec moi yeu cau:

- Nhieu campaign song song
- Moi campaign co nguong rieng
- Moi campaign co ten qua tang va gia tri qua tang rieng
- 1 hoa don co the duoc cong vao nhieu campaign
- Trang phai hien danh sach campaign, khong chi 1 tong progress duy nhat

## 5. API hien tai chua khop

Hook hien tai:

- `useMyRewardTracking()` goi `/customer-rewards/my-tracking`
- `useMyRewardHistory()` goi `/customer-rewards/my-history`

Van de:

- `my-tracking` hien dang tra model tong hop cu, khong phai danh sach campaign
- Chua thay `rewardName`
- Chua thay `promotionId`
- Chua thay `promotionName`
- Chua thay `isEligible` theo tung campaign
- Chua thay `remainingAmount` theo tung campaign

## 6. Huong map sang spec moi

### 6.1 Route frontend

Giu route:

- `/rewards`

### 6.2 Hook frontend

De xuat:

- Thay `useMyRewardTracking()` bang hook moi lay danh sach campaign progress
- Co the giu `useMyRewardHistory()` neu backend lich su qua tang van phu hop

### 6.3 UI

Tab `Tich luy hien tai`:

- Doi tu 1 progress card tong thanh danh sach campaign cards

Moi card can hien:

- `promotionName`
- `rewardName`
- `rewardValue`
- `qualifiedAmount`
- `thresholdAmount`
- `remainingAmount`
- `isEligible`

Tab `Lich su qua tang`:

- Co the giu
- Neu can, bo sung thong tin `promotionName` trong lich su

## 7. Ket luan

Trang `/rewards` hien tai khong can bo di.

Huong tot nhat:

- Tai su dung route va bo khung UI
- Doi model du lieu tu `single tracking` sang `campaign list tracking`
- Giu lich su qua tang neu backend hien tai van dung duoc
