# Promotion Customer Portal Wireframe

## 1. Muc tieu

Tai lieu nay phac thao noi dung va cau truc man hinh khach hang tren Next.js de:

- xem tien do tich luy
- xem so luot quay
- bam quay thuong
- xem qua da trung

## 2. Muc tieu giao dien

Khach hang can xem nhanh:

- Dang tham gia campaign nao
- Da tich luy duoc bao nhieu
- Da co bao nhieu luot quay
- Con bao nhieu luot quay
- Da trung bao nhieu lan
- Co the bam quay ngay neu con luot

## 3. Cau truc trang de xuat

Ten trang:

- `Khuyen mai cua toi`

Sections:

- Header trang
- Danh sach campaign dang theo doi
- Modal / panel quay thuong
- Lich su quay cua toi

## 4. Wireframe muc cao

```text
+------------------------------------------------------+
| Khuyen mai cua toi                                   |
| Tich luy mua hang, nhan luot quay va san qua         |
+------------------------------------------------------+

+------------------------------------------------------+
| [Ten campaign]                                       |
| Thoi gian: 01/07/2026 - 31/10/2026                   |
| Moc cong 1 luot: 5.000.000d                          |
| Qua noi bat: Quat 300k, Am 200k, Dau an 100k         |
|                                                      |
| Da tich luy: 12.000.000d                             |
| Luot quay da co: 2                                   |
| Da dung: 1 | Con lai: 1                              |
| So lan da trung: 1                                   |
| [####################] 100%                          |
| [ Quay ngay ]                                        |
+------------------------------------------------------+
```

## 5. Noi dung moi card campaign

Moi card hien thi:

- `promotionName`
- `startAt - endAt`
- `thresholdAmount`
- `qualifiedAmount`
- `earnedSpinCount`
- `usedSpinCount`
- `remainingSpinCount`
- `winCount`
- `featuredRewards`
- nut `Quay ngay`

## 6. Modal quay thuong

Khi bam `Quay ngay`:

- mo modal / sheet
- hien vong quay hoac animation
- call API spin
- hien ket qua:
  - `Ban da trung ...`
  - hoac `Chuc ban may man lan sau`

Sau khi quay:

- cap nhat lai card campaign
- cap nhat lai lich su quay

## 7. Empty state

Neu khach chua co campaign nao:

- `Ban chua tham gia chuong trinh nao`

Neu co campaign nhung chua co luot quay:

- `Ban chua du moc de nhan luot quay`

## 8. Ghi chu UX

- Uu tien mobile
- Nut quay phai noi bat
- Khong cho bam quay neu `remainingSpinCount = 0`
- Neu campaign con nhung quota thang hien tai het, frontend khong tu tinh; chi hien thong diep backend tra ve

## 9. Mo rong sau

- Hien thong tin qua da reserve
- Hien thong tin da trao qua
- Hien lich su tung lan quay chi tiet
