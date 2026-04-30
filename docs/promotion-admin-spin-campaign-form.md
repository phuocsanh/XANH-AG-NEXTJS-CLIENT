# Promotion Admin Spin Campaign Form

## 1. Muc tieu

Tai lieu nay mo ta form admin tao / sua campaign quay thuong tich luy.

Muc tieu:

- Dev UI co the dung tai lieu nay de dung man hinh tao / sua campaign
- Chot ro field, validation, section va hanh vi form

## 2. Tong quan man hinh

Ten trang de xuat:

- `Tao campaign quay thuong`
- `Chinh sua campaign quay thuong`

Cau truc man hinh:

1. Thong tin campaign
2. Cau hinh tich luy va luot quay
3. San pham ap dung
4. Co cau qua tang
5. Quota qua theo thang
6. Summary va nut luu

## 3. Section 1: Thong tin campaign

Field:

- `code`
  - label: `Ma campaign`
  - text input
  - required
  - unique

- `name`
  - label: `Ten campaign`
  - text input
  - required

- `status`
  - label: `Trang thai`
  - select
  - options:
    - `draft`
    - `active`
    - `ended`
    - `archived`

- `startAt`
  - label: `Bat dau`
  - datetime
  - required

- `endAt`
  - label: `Ket thuc`
  - datetime
  - required

- `notes`
  - label: `Ghi chu`
  - textarea
  - optional

Validation:

- `endAt > startAt`

## 4. Section 2: Cau hinh tich luy va luot quay

Field:

- `thresholdAmount`
  - label: `Nguong cong 1 luot quay`
  - number
  - required
  - > 0

- `baseWinRate`
  - label: `Xac suat trung co ban`
  - number
  - don vi: `%`
  - required
  - min `0`
  - max `100`

- `secondWinRate`
  - label: `Xac suat trung lan 2`
  - number
  - don vi: `%`
  - default `2`
  - readonly hoac editable theo policy

- `maxWinPerCustomer`
  - label: `So lan trung toi da / khach`
  - number
  - default `2`
  - readonly hoac editable theo policy

Text helper:

- `Moi lan tong tich luy vuot them 1 nguong se cong 1 luot quay`
- `Sau khi trung 1 lan, cac luot quay tiep theo chi con xac suat trung lan 2`

## 5. Section 3: San pham ap dung

Field:

- `productIds`
  - label: `San pham ap dung`
  - multi select / async combobox
  - required

Hanh vi:

- Co the tim theo ten, ma, ten thuong mai
- Hien tong so san pham da chon

Validation:

- Phai co it nhat 1 san pham

## 6. Section 4: Co cau qua tang

Section nay dung tai lieu chi tiet:

- [promotion-admin-reward-configuration-form.md](/Users/phuocsanh/My-Document/My-Tech/Xanh-AG-Source/XANH-AG-NEXTJS-CLIENT/docs/promotion-admin-reward-configuration-form.md:1)

Tom tat:

- Admin nhap theo tung dong qua
- Moi dong qua co:
  - `rewardName`
  - `rewardValue`
  - `totalQuantity`
- He thong tu tinh:
  - tong so qua toi da
  - tong gia tri qua toi da

## 7. Section 5: Quota qua theo thang

Muc tieu:

- Chia quota tung loai qua theo tung thang cua campaign

UI de xuat:

- Bang matrix
- Moi hang = 1 loai qua
- Moi cot = 1 thang trong campaign

Vi du campaign 4 thang:

- Thang 1
- Thang 2
- Thang 3
- Thang 4

Field moi o:

- `releaseQuantity`

Validation:

- Tong quota cac thang cua 1 loai qua phai bang `totalQuantity`

Neu campaign 3.5 thang:

- van chia theo bucket thang
- thang cuoi la bucket ngan hon

## 8. Section 6: Summary

Summary box cuoi form can hien:

- `Tong so san pham ap dung`
- `Tong so loai qua`
- `Tong so qua toi da`
- `Tong gia tri qua toi da`
- `Nguong cong 1 luot quay`
- `Xac suat trung co ban`
- `Xac suat trung lan 2`

Neu muon tot hon, them:

- `Thoi gian campaign`
- `So thang phat qua`

## 9. Nut thao tac

Nut:

- `Luu nhap`
- `Kich hoat campaign`
- `Huy`

Rule:

- `Luu nhap` luu voi status `draft`
- `Kich hoat campaign` chi cho phep khi form hop le

## 10. Validation tong the

Campaign hop le khi:

- Co `code`
- Co `name`
- Co thoi gian hop le
- Co `thresholdAmount > 0`
- Co `baseWinRate` hop le
- Co it nhat 1 san pham
- Co it nhat 1 loai qua
- Moi loai qua hop le
- Quota theo thang hop le

## 11. Payload de xuat gui backend

```json
{
  "code": "SPIN-Q3-2026",
  "name": "Tich luy mua thuoc quay nhan qua quy 3",
  "status": "draft",
  "startAt": "2026-07-01T00:00:00.000Z",
  "endAt": "2026-10-31T23:59:59.999Z",
  "thresholdAmount": 5000000,
  "baseWinRate": 20,
  "secondWinRate": 2,
  "maxWinPerCustomer": 2,
  "notes": "Campaign quay thuong quy 3",
  "productIds": [101, 102, 103],
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
    }
  ]
}
```

## 12. Hanh vi khi chinh sua

Neu campaign da co du lieu van hanh:

- khong nen cho sua tung field nguy hiem mot cach tu do

Field nen han che sau khi active:

- `thresholdAmount`
- `baseWinRate`
- `secondWinRate`
- `maxWinPerCustomer`
- `productIds`

Field co the cho sua de mem hon:

- `name`
- `notes`

Quy tac cuoi cung tuy backend/business policy.

## 13. QA checklist

- Tao campaign moi
- Validate field rong
- Validate thoi gian
- Validate khong co san pham
- Validate khong co qua
- Validate quota thang
- Tinh dung summary
- Luu draft
- Kich hoat campaign
- Mo lai sua campaign

## 14. Ghi chu cho dev

- Nen chia thanh cac card/section ro rang
- Section `Co cau qua tang` va `Quota qua theo thang` la 2 phan phuc tap nhat
- Summary box nen cap nhat realtime
- Khong cho admin nhap tong ngan sach campaign bang tay
