# Promotion Customer Portal API Contract

## 1. Muc tieu

Tai lieu nay mo ta contract du lieu backend can tra cho frontend Next.js de khach hang:

- xem tien do tich luy campaign
- xem so luot quay
- tu quay nhan qua
- xem lich su quay va qua da trung

## 2. Dieu kien truy cap

API chi tra du lieu cho khach hang da xac thuc.

Rule:

- Khong cho query tu do theo `customerId`.
- Backend lay `customer_id` tu user dang nhap.

## 3. Endpoint de xuat

### 3.1 Danh sach campaign cua toi

`GET /api/customer/promotions/progress`

Muc dich:

- Lay danh sach campaign khach dang tham gia.

### 3.2 Lich su quay cua toi theo campaign

`GET /api/customer/promotions/:promotionId/spins`

Muc dich:

- Lay lich su quay cua khach trong campaign.

### 3.3 Quay thuong

`POST /api/customer/promotions/:promotionId/spin`

Muc dich:

- Dung 1 luot quay va tra ket qua trung / khong trung.

## 4. Response model de xuat

### 4.1 Danh sach campaign

```json
{
  "items": [
    {
      "promotionId": 12,
      "promotionName": "Tich luy thuoc quay nhan qua quy 3",
      "startAt": "2026-07-01T00:00:00.000Z",
      "endAt": "2026-10-31T23:59:59.999Z",
      "thresholdAmount": 5000000,
      "qualifiedAmount": 12000000,
      "remainingAmount": 0,
      "earnedSpinCount": 2,
      "usedSpinCount": 1,
      "remainingSpinCount": 1,
      "winCount": 1,
      "statusLabel": "Con 1 luot quay",
      "featuredRewards": [
        {
          "rewardName": "Quat mini",
          "rewardValue": 300000
        },
        {
          "rewardName": "Am dun nuoc",
          "rewardValue": 200000
        }
      ]
    }
  ]
}
```

### 4.2 Ket qua quay

```json
{
  "success": true,
  "resultType": "win",
  "remainingSpinCount": 0,
  "winCount": 1,
  "reward": {
    "rewardName": "Dau an",
    "rewardValue": 100000
  },
  "message": "Ban da trung Dau an"
}
```

Hoac:

```json
{
  "success": true,
  "resultType": "lose",
  "remainingSpinCount": 0,
  "winCount": 1,
  "reward": null,
  "message": "Chuc ban may man lan sau"
}
```

### 4.3 Truong can tra

- `qualifiedAmount`: tong gia tri tich luy hop le
- `earnedSpinCount`: tong so luot quay da duoc cong
- `usedSpinCount`: tong so luot quay da dung
- `remainingSpinCount`: tong so luot quay con lai
- `winCount`: so lan da trung trong campaign
- `featuredRewards`: danh sach qua noi bat de frontend hien card

## 5. Rule backend phai tinh san

### 5.1 So luot quay duoc cong

`earnedSpinCount = floor(qualifiedAmount / thresholdAmount)`

### 5.2 So luot quay con lai

`remainingSpinCount = max(earnedSpinCount - usedSpinCount, 0)`

### 5.3 Quay trung lan 2

- Neu `winCount = 0` thi dung `baseWinRate`
- Neu `winCount = 1` thi dung `2%`
- Neu `winCount >= 2` thi `resultType = lose`

## 6. Rule dong bo nghiep vu

- Tinh theo `total_price` tren hoa don
- Chi tinh hoa don `da xac nhan`
- Don huy/hoan thi tru lai tich luy
- Moi lan vuot them 1 nguong thi cong 1 luot quay
- Quay 1 lan thi tru 1 luot
- Neu trung thi reserve qua ngay
- Lan trung thu 2 khong duoc trung lai cung loai qua da trung
- Dinh danh khach hang bang `customer_id`

## 7. Anti-oversell

API `spin` bat buoc:

- dung transaction
- lock quota qua truoc khi reserve
- neu con 1 qua va 2 request cung luc thi chi 1 request duoc reserve thanh cong

## 8. Mo rong sau

Co the them:

- chi tiet quota qua theo thang
- lich su nhan qua
- thong tin reserve / da trao qua
