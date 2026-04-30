# Promotion Admin Reward Configuration Form

## 1. Muc tieu

Tai lieu nay mo ta rieng form admin dung de cau hinh co cau qua tang cho campaign quay thuong tich luy.

Muc tieu:

- Admin nhap duoc nhieu loai qua
- Moi loai qua co gia tri va so luong rieng
- He thong tu tinh tong so qua va tong gia tri toi da
- UI ro rang de dev co the implement ngay

## 2. Nguyen tac nghiep vu

- Admin khong nhap 1 truong `tong ngan sach` thu cong.
- Admin nhap theo tung dong qua thuc te.
- Moi dong qua phai co:
  - `Ten qua`
  - `Gia tri qua`
  - `Tong so luong`
- Co the co them quota theo thang cho tung dong qua.
- He thong tu suy ra:
  - `Tong so qua toi da`
  - `Tong gia tri qua toi da`

## 3. Vi tri trong admin

De xuat:

- Trang `Tao / Sua campaign`
- Section hoac tab rieng: `Co cau qua tang`

## 4. Cau truc form

### 4.1 Header section

Hien thi:

- Tieu de: `Co cau qua tang`
- Mo ta ngan:
  - `Nhap tung loai qua, gia tri va so luong. He thong tu tinh tong so qua va tong gia tri toi da cua campaign.`

### 4.2 Bang danh sach qua

Moi dong qua gom:

- `rewardName`
  - label: `Ten qua`
  - input text
  - bat buoc

- `rewardValue`
  - label: `Gia tri qua`
  - input number
  - bat buoc
  - don vi: `VND`

- `totalQuantity`
  - label: `Tong so luong`
  - input number integer
  - bat buoc
  - min = `1`

- `estimatedTotalValue`
  - chi doc
  - cong thuc: `rewardValue * totalQuantity`

- `action`
  - nut `Xoa dong`

### 4.3 Nut thao tac

- Nut `Them loai qua`
- Nut `Xoa dong`

## 5. Validation

Moi dong qua phai hop le:

- `rewardName` khong duoc rong
- `rewardValue > 0`
- `totalQuantity >= 1`

Validation muc form:

- Phai co it nhat `1` dong qua
- Khong cho 2 dong qua co `rewardName` giong nhau neu muon giu cau hinh gon

## 6. Tong hop he thong tinh san

UI phai hien mot summary box ben duoi bang:

- `Tong so loai qua`
- `Tong so qua toi da`
- `Tong gia tri qua toi da`

Cong thuc:

- `Tong so loai qua = so dong qua`
- `Tong so qua toi da = sum(totalQuantity)`
- `Tong gia tri qua toi da = sum(rewardValue * totalQuantity)`

## 7. Quota theo thang

Neu campaign co chia quota theo thang, moi dong qua co them section mo rong:

- `Thang 1`
- `Thang 2`
- `Thang 3`
- `Thang 4`

Moi thang nhap:

- `releaseQuantity`

Rule:

- Tong `releaseQuantity` cac thang cua 1 dong qua khong duoc vuot `totalQuantity`
- Neu tong nho hon `totalQuantity`, phan con lai co the:
  - canh bao
  - hoac he thong tu dong dua vao thang cuoi cung

De xuat cho phase dau:

- Admin nhap tay quota tung thang
- UI hien canh bao neu tong quota thang khac `totalQuantity`

## 8. Hanh vi UI de xuat

### 8.1 Khi them dong moi

Default:

- `rewardName = ""`
- `rewardValue = 0`
- `totalQuantity = 1`

### 8.2 Khi sua gia tri hoac so luong

UI phai tinh lai ngay:

- `estimatedTotalValue` cua dong
- `Tong so qua toi da`
- `Tong gia tri qua toi da`

### 8.3 Khi xoa dong

- Cap nhat lai summary ngay
- Neu chi con 1 dong, co the:
  - van cho xoa
  - nhung form save se fail do vi pham rule phai co it nhat 1 qua

## 9. De xuat payload frontend gui backend

```json
{
  "rewards": [
    {
      "rewardName": "Quat mini",
      "rewardValue": 300000,
      "totalQuantity": 2,
      "monthlyRelease": [
        { "monthIndex": 1, "releaseQuantity": 1 },
        { "monthIndex": 2, "releaseQuantity": 0 },
        { "monthIndex": 3, "releaseQuantity": 0 },
        { "monthIndex": 4, "releaseQuantity": 1 }
      ]
    },
    {
      "rewardName": "Am dun nuoc",
      "rewardValue": 200000,
      "totalQuantity": 4,
      "monthlyRelease": [
        { "monthIndex": 1, "releaseQuantity": 1 },
        { "monthIndex": 2, "releaseQuantity": 1 },
        { "monthIndex": 3, "releaseQuantity": 1 },
        { "monthIndex": 4, "releaseQuantity": 1 }
      ]
    }
  ]
}
```

## 10. Text hien thi de xuat

- Tieu de section: `Co cau qua tang`
- Nut them: `Them loai qua`
- Cot bang:
  - `Ten qua`
  - `Gia tri`
  - `So luong`
  - `Tong gia tri`
  - `Thao tac`
- Summary:
  - `Tong so loai qua`
  - `Tong so qua toi da`
  - `Tong gia tri qua toi da`

## 11. QA checklist cho form

- Them nhieu dong qua
- Xoa dong qua
- Validate field rong
- Validate gia tri <= 0
- Validate so luong < 1
- Tinh dung tong so qua
- Tinh dung tong gia tri toi da
- Validate tong quota thang cua 1 qua

## 12. Ghi chu cho dev

- Nen dung editable table hoac repeater rows
- Summary box nen sticky hoac de ro ben duoi
- Currency format phai theo `vi-VN`
- Khong de frontend tu nhap tong ngan sach campaign
